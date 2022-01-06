import TheWordOfferingHouseABI from '../abi/contracts/TheWordOfferingHouse.sol/TheWordOfferingHouse.json';
import { Interface } from 'ethers/lib/utils';
import { task, types } from 'hardhat/config';
import promptjs from 'prompt';
//import { default as TheWordOfferingHouseABI }
//from '../abi/contracts/TheWordOfferingHouse.sol/TheWordOfferingHouse.json';
//import TheWordOfferingHouseABI
//from '../abi/contracts/TheWordOfferingHouse.sol/TheWordOfferingHouse.json';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

type ContractName =
  | 'NFTDescriptor'
  | 'TheWordDescriptor'
  | 'TheWordSeeder'
  | 'TheWordToken'
  | 'TheWordOfferingHouse'
  | 'TheWordOfferingHouseProxyAdmin'
  | 'TheWordOfferingHouseProxy'
  | 'TheWordDAOExecutor'
  | 'TheWordDAOLogicV1'
  | 'TheWordDAOProxy';

interface Contract {
  args?: (string | number | (() => string | undefined))[];
  address?: string;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task('deploy', 'Deploys NFTDescriptor, thewordDescriptor, thewordSeeder, and thewordToken')
  .addParam('theworddersdao', 'The thewordders DAO contract address', undefined, types.string)
  .addParam('weth', 'The WETH contract address', undefined, types.string)
  .addOptionalParam('offeringTimeBuffer', 'The offering time buffer (seconds)', 5 * 60, types.int)
  .addOptionalParam('offeringReservePrice', 'The offering reserve price (wei)', 1, types.int)
  .addOptionalParam(
    'offeringMinIncrementBidPercentage',
    'The offering min increment bid percentage (out of 100)',
    5,
    types.int,
  )
  .addOptionalParam('offeringDuration', 'The offering duration (seconds)', 60 * 60 * 24, types.int) // Default: 24 hours
  .addOptionalParam('timelockDelay', 'The timelock delay (seconds)', 60 * 60 * 24 * 2, types.int) // Default: 2 days
  .addOptionalParam('votingPeriod', 'The voting period (blocks)', 4 * 60 * 24 * 3, types.int) // Default: 3 days
  .addOptionalParam('votingDelay', 'The voting delay (blocks)', 1, types.int) // Default: 1 block
  .addOptionalParam('proposalThresholdBps', 'The proposal threshold (basis points)', 500, types.int) // Default: 5%
  .addOptionalParam('quorumVotesBps', 'Votes required for quorum (basis points)', 1_000, types.int) // Default: 10%
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    const proxyRegistryAddress =
      network.chainId === 1
        ? '0xa5409ec958c83c3f309868babaca7c86dcb077c1'
        : '0xf57b2c51ded3a29e6891aba85459d600256cf317';

    const OFFERING_HOUSE_PROXY_NONCE_OFFSET = 6;
    const GOVERNOR_N_DELEGATOR_NONCE_OFFSET = 9;

    const [deployer] = await ethers.getSigners();
    const nonce = await deployer.getTransactionCount();
    const expectedOfferingHouseProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + OFFERING_HOUSE_PROXY_NONCE_OFFSET,
    });
    const expectedTheWordDAOProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + GOVERNOR_N_DELEGATOR_NONCE_OFFSET,
    });
    const contracts: Record<ContractName, Contract> = {
      NFTDescriptor: {},
      TheWordDescriptor: {
        libraries: () => ({
          NFTDescriptor: contracts.NFTDescriptor.address as string,
        }),
      },
      TheWordSeeder: {},
      TheWordToken: {
        args: [
          args.theworddersdao,
          expectedOfferingHouseProxyAddress,
          () => contracts.TheWordDescriptor.address,
          () => contracts.TheWordSeeder.address,
          proxyRegistryAddress,
        ],
      },
      TheWordOfferingHouse: {
        waitForConfirmation: true,
      },
      TheWordOfferingHouseProxyAdmin: {},
      TheWordOfferingHouseProxy: {
        args: [
          () => contracts.TheWordOfferingHouse.address,
          () => contracts.TheWordOfferingHouseProxyAdmin.address,
          () =>
            new Interface(TheWordOfferingHouseABI).encodeFunctionData('initialize', [
              contracts.TheWordToken.address,
              args.weth,
              args.offeringTimeBuffer,
              args.offeringReservePrice,
              args.offeringMinIncrementBidPercentage,
              args.offeringDuration,
            ]),
        ],
      },
      TheWordDAOExecutor: {
        args: [expectedTheWordDAOProxyAddress, args.timelockDelay],
      },
      TheWordDAOLogicV1: {
        waitForConfirmation: true,
      },
      TheWordDAOProxy: {
        args: [
          () => contracts.TheWordDAOExecutor.address,
          () => contracts.TheWordToken.address,
          args.theworddersdao,
          () => contracts.TheWordDAOExecutor.address,
          () => contracts.TheWordDAOLogicV1.address,
          args.votingPeriod,
          args.votingDelay,
          args.proposalThresholdBps,
          args.quorumVotesBps,
        ],
      },
    };

    let gasPrice = await ethers.provider.getGasPrice();
    const gasInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, 'gwei')));

    promptjs.start();

    let result = await promptjs.get([
      {
        properties: {
          gasPrice: {
            type: 'integer',
            required: true,
            description: 'Enter a gas price (gwei)',
            default: gasInGwei,
          },
        },
      },
    ]);

    gasPrice = ethers.utils.parseUnits(result.gasPrice.toString(), 'gwei');

    for (const [name, contract] of Object.entries(contracts)) {
      const factory = await ethers.getContractFactory(name, {
        libraries: contract?.libraries?.(),
      });

      const deploymentGas = await factory.signer.estimateGas(
        factory.getDeployTransaction(
          ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
          {
            gasPrice,
          },
        ),
      );
      const deploymentCost = deploymentGas.mul(gasPrice);

      console.log(
        `Estimated cost to deploy ${name}: ${ethers.utils.formatUnits(
          deploymentCost,
          'ether',
        )} ETH`,
      );

      result = await promptjs.get([
        {
          properties: {
            confirm: {
              type: 'string',
              description: 'Type "DEPLOY" to confirm:',
            },
          },
        },
      ]);

      if (result.confirm != 'DEPLOY') {
        console.log('Exiting');
        return;
      }

      console.log('Deploying...');

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
        {
          gasPrice,
        },
      );

      if (contract.waitForConfirmation) {
        await deployedContract.deployed();
      }

      contracts[name as ContractName].address = deployedContract.address;

      console.log(`${name} contract deployed to ${deployedContract.address}`);
    }

    return contracts;
  });
