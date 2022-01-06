import { task, types } from 'hardhat/config';
import { Interface } from 'ethers/lib/utils';
import { Contract as EthersContract } from 'ethers';
//import { default as TheWordOfferingHouseABI } from '../abi/contracts/TheWordOfferingHouse.sol/TheWordOfferingHouse.json';
import TheWordOfferingHouseABI from '../abi/contracts/TheWordOfferingHouse.sol/TheWordOfferingHouse.json';

type ContractName =
  | 'WETH'
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
  instance?: EthersContract;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task('deploy-local', 'Deploy contracts to hardhat')
  .addOptionalParam('theworddersdao', 'The thewordders DAO contract address')
  .addOptionalParam('offeringTimeBuffer', 'The offering time buffer (seconds)', 30, types.int) // Default: 30 seconds
  .addOptionalParam('offeringReservePrice', 'The offering reserve price (wei)', 1, types.int) // Default: 1 wei
  .addOptionalParam(
    'offeringMinIncrementBidPercentage',
    'The offering min increment bid percentage (out of 100)', // Default: 5%
    5,
    types.int,
  )
  .addOptionalParam('offeringDuration', 'The offering duration (seconds)', 60 * 2, types.int) // Default: 2 minutes
  .addOptionalParam('timelockDelay', 'The timelock delay (seconds)', 60 * 60 * 24 * 2, types.int) // Default: 2 days
  .addOptionalParam('votingPeriod', 'The voting period (blocks)', 4 * 60 * 24 * 3, types.int) // Default: 3 days
  .addOptionalParam('votingDelay', 'The voting delay (blocks)', 1, types.int) // Default: 1 block
  .addOptionalParam('proposalThresholdBps', 'The proposal threshold (basis points)', 500, types.int) // Default: 5%
  .addOptionalParam('quorumVotesBps', 'Votes required for quorum (basis points)', 1_000, types.int) // Default: 10%
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337) {
      console.log(`Invalid chain id. Expected 31337. Got: ${network.chainId}.`);
      return;
    }

    const proxyRegistryAddress = '0xa5409ec958c83c3f309868babaca7c86dcb077c1';

    const OFFERING_HOUSE_PROXY_NONCE_OFFSET = 7;
    const GOVERNOR_N_DELEGATOR_NONCE_OFFSET = 10;

    const [deployer] = await ethers.getSigners();
    const nonce = await deployer.getTransactionCount();
    const expectedTheWordDAOProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + GOVERNOR_N_DELEGATOR_NONCE_OFFSET,
    });
    const expectedOfferingHouseProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + OFFERING_HOUSE_PROXY_NONCE_OFFSET,
    });
    const contracts: Record<ContractName, Contract> = {
      WETH: {},
      NFTDescriptor: {},
      TheWordDescriptor: {
        libraries: () => ({
          NFTDescriptor: contracts.NFTDescriptor.instance?.address as string,
        }),
      },
      TheWordSeeder: {},
      TheWordToken: {
        args: [
          args.theworddersdao || deployer.address,
          expectedOfferingHouseProxyAddress,
          () => contracts.TheWordDescriptor.instance?.address,
          () => contracts.TheWordSeeder.instance?.address,
          proxyRegistryAddress,
        ],
      },
      TheWordOfferingHouse: {
        waitForConfirmation: true,
      },
      TheWordOfferingHouseProxyAdmin: {},
      TheWordOfferingHouseProxy: {
        args: [
          () => contracts.TheWordOfferingHouse.instance?.address,
          () => contracts.TheWordOfferingHouseProxyAdmin.instance?.address,
          () =>
            new Interface(TheWordOfferingHouseABI).encodeFunctionData('initialize', [
              contracts.TheWordToken.instance?.address,
              contracts.WETH.instance?.address,
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
          () => contracts.TheWordDAOExecutor.instance?.address,
          () => contracts.TheWordToken.instance?.address,
          args.theworddersdao || deployer.address,
          () => contracts.TheWordDAOExecutor.instance?.address,
          () => contracts.TheWordDAOLogicV1.instance?.address,
          args.votingPeriod,
          args.votingDelay,
          args.proposalThresholdBps,
          args.quorumVotesBps,
        ],
      },
    };

    for (const [name, contract] of Object.entries(contracts)) {
      const factory = await ethers.getContractFactory(name, {
        libraries: contract?.libraries?.(),
      });

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
      );

      if (contract.waitForConfirmation) {
        await deployedContract.deployed();
      }

      contracts[name as ContractName].instance = deployedContract;

      console.log(`${name} contract deployed to ${deployedContract.address}`);
    }

    return contracts;
  });
