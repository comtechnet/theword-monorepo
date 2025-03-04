import { TASK_COMPILE, TASK_NODE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';

task(
  'run-local',
  'Start a hardhat node, deploy contracts, and execute setup transactions',
).setAction(async (_, { ethers, run }) => {
  await run(TASK_COMPILE);

  await Promise.race([run(TASK_NODE), new Promise(resolve => setTimeout(resolve, 2_000))]);

  const contracts = await run('deploy-local');

  await run('populate-descriptor', {
    nftDescriptor: contracts.NFTDescriptor.instance.address,
    thewordDescriptor: contracts.thewordDescriptor.instance.address,
  });

  await contracts.thewordOfferingHouse.instance
    .attach(contracts.thewordOfferingHouseProxy.instance.address)
    .unpause({
      gasLimit: 1_000_000,
    });

  await run('create-proposal', {
    thewordDaoProxy: contracts.thewordDAOProxy.instance.address,
  });

  const { chainId } = await ethers.provider.getNetwork();

  const accounts = {
    'Account #0': {
      Address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      'Private Key': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    'Account #1': {
      Address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      'Private Key': '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    },
  };

  console.table(accounts);
  console.log(
    `TheWord contracts deployed to local node at http://localhost:8545 (Chain ID: ${chainId})`,
  );
  console.log(
    `Offering House Proxy address: ${contracts.thewordOfferingHouseProxy.instance.address}`,
  );
  console.log(`theword ERC721 address: ${contracts.thewordToken.instance.address}`);
  console.log(`TheWord DAO Executor address: ${contracts.thewordDAOExecutor.instance.address}`);
  console.log(`TheWord DAO Proxy address: ${contracts.thewordDAOProxy.instance.address}`);

  await ethers.provider.send('evm_setIntervalMining', [12_000]);

  await new Promise(() => {
    /* keep node alive until this process is killed */
  });
});
