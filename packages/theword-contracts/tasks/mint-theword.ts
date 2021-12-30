import { task, types } from 'hardhat/config';

task('mint-theword', 'Mints a TheWord')
  .addOptionalParam(
    'thewordToken',
    'The `thewordToken` contract address',
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    types.string,
  )
  .setAction(async ({ thewordToken }, { ethers }) => {
    const nftFactory = await ethers.getContractFactory('thewordToken');
    const nftContract = nftFactory.attach(thewordToken);

    const receipt = await (await nftContract.mint()).wait();
    const thewordCreated = receipt.events?.[1];
    const { tokenId } = thewordCreated?.args;

    console.log(`TheWord minted with ID: ${tokenId.toString()}.`);
  });
