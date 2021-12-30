import chai from 'chai';
import { ethers } from 'hardhat';
import { BigNumber as EthersBN, constants } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { thewordDescriptor__factory as thewordDescriptorFactory, thewordToken } from '../typechain';
import { deploythewordToken, populateDescriptor } from './utils';

chai.use(solidity);
const { expect } = chai;

describe('thewordToken', () => {
  let thewordToken: thewordToken;
  let deployer: SignerWithAddress;
  let theworddersDAO: SignerWithAddress;
  let snapshotId: number;

  before(async () => {
    [deployer, theworddersDAO] = await ethers.getSigners();
    thewordToken = await deploythewordToken(deployer, theworddersDAO.address, deployer.address);

    const descriptor = await thewordToken.descriptor();

    await populateDescriptor(thewordDescriptorFactory.connect(descriptor, deployer));
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  it('should allow the minter to mint a theword to itself and a reward theword to the theworddersDAO', async () => {
    const receipt = await (await thewordToken.mint()).wait();

    const [, , , theworddersTheWordCreated, , , , ownersTheWordCreated] = receipt.events || [];

    expect(await thewordToken.ownerOf(0)).to.eq(theworddersDAO.address);
    expect(theworddersTheWordCreated?.event).to.eq('TheWordCreated');
    expect(theworddersTheWordCreated?.args?.tokenId).to.eq(0);
    expect(theworddersTheWordCreated?.args?.seed.length).to.equal(5);

    expect(await thewordToken.ownerOf(1)).to.eq(deployer.address);
    expect(ownersTheWordCreated?.event).to.eq('TheWordCreated');
    expect(ownersTheWordCreated?.args?.tokenId).to.eq(1);
    expect(ownersTheWordCreated?.args?.seed.length).to.equal(5);

    theworddersTheWordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });

    ownersTheWordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });
  });

  it('should set symbol', async () => {
    expect(await thewordToken.symbol()).to.eq('THEWORD');
  });

  it('should set name', async () => {
    expect(await thewordToken.name()).to.eq('theword');
  });

  it('should allow minter to mint a theword to itself', async () => {
    await (await thewordToken.mint()).wait();

    const receipt = await (await thewordToken.mint()).wait();
    const thewordCreated = receipt.events?.[3];

    expect(await thewordToken.ownerOf(2)).to.eq(deployer.address);
    expect(thewordCreated?.event).to.eq('TheWordCreated');
    expect(thewordCreated?.args?.tokenId).to.eq(2);
    expect(thewordCreated?.args?.seed.length).to.equal(5);

    thewordCreated?.args?.seed.forEach((item: EthersBN | number) => {
      const value = typeof item !== 'number' ? item?.toNumber() : item;
      expect(value).to.be.a('number');
    });
  });

  it('should emit two transfer logs on mint', async () => {
    const [, , creator, minter] = await ethers.getSigners();

    await (await thewordToken.mint()).wait();

    await (await thewordToken.setMinter(minter.address)).wait();
    await (await thewordToken.transferOwnership(creator.address)).wait();

    const tx = thewordToken.connect(minter).mint();

    await expect(tx)
      .to.emit(thewordToken, 'Transfer')
      .withArgs(constants.AddressZero, creator.address, 2);
    await expect(tx).to.emit(thewordToken, 'Transfer').withArgs(creator.address, minter.address, 2);
  });

  it('should allow minter to burn a theword', async () => {
    await (await thewordToken.mint()).wait();

    const tx = thewordToken.burn(0);
    await expect(tx).to.emit(thewordToken, 'TheWordBurned').withArgs(0);
  });

  it('should revert on non-minter mint', async () => {
    const account0AsTheWordErc721Account = thewordToken.connect(theworddersDAO);
    await expect(account0AsTheWordErc721Account.mint()).to.be.reverted;
  });

  describe('contractURI', async () => {
    it('should return correct contractURI', async () => {
      expect(await thewordToken.contractURI()).to.eq(
        'ipfs://QmZi1n79FqWt2tTLwCqiy6nLM6xLGRsEPQ5JmReJQKNNzX',
      );
    });
    it('should allow owner to set contractURI', async () => {
      await thewordToken.setContractURIHash('ABC123');
      expect(await thewordToken.contractURI()).to.eq('ipfs://ABC123');
    });
    it('should not allow non owner to set contractURI', async () => {
      const [, nonOwner] = await ethers.getSigners();
      await expect(thewordToken.connect(nonOwner).setContractURIHash('BAD')).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });
  });
});
