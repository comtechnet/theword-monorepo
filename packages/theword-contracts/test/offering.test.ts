import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { constants } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  MaliciousBidder__factory as MaliciousBidderFactory,
  TheWordOfferingHouse,
  TheWordDescriptor__factory as thewordDescriptorFactory,
  TheWordToken,
  Weth,
} from '../typechain';
import { deployTheWordToken, deployWeth, populateDescriptor } from './utils';

chai.use(solidity);
const { expect } = chai;

describe('thewordOfferingHouse', () => {
  let thewordOfferingHouse: TheWordOfferingHouse;
  let thewordToken: TheWordToken;
  let weth: Weth;
  let deployer: SignerWithAddress;
  let theworddersDAO: SignerWithAddress;
  let bidderA: SignerWithAddress;
  let bidderB: SignerWithAddress;
  let snapshotId: number;

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  async function deploy(deployer?: SignerWithAddress) {
    const offeringHouseFactory = await ethers.getContractFactory('thewordOfferingHouse', deployer);
    return upgrades.deployProxy(offeringHouseFactory, [
      thewordToken.address,
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    ]) as Promise<TheWordOfferingHouse>;
  }

  before(async () => {
    [deployer, theworddersDAO, bidderA, bidderB] = await ethers.getSigners();

    thewordToken = await deployTheWordToken(deployer, theworddersDAO.address, deployer.address);
    weth = await deployWeth(deployer);
    thewordOfferingHouse = await deploy(deployer);

    const descriptor = await thewordToken.descriptor();

    await populateDescriptor(thewordDescriptorFactory.connect(descriptor, deployer));

    await thewordToken.setMinter(thewordOfferingHouse.address);
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  it('should revert if a second initialization is attempted', async () => {
    const tx = thewordOfferingHouse.initialize(
      thewordToken.address,
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    );
    await expect(tx).to.be.revertedWith('Initializable: contract is already initialized');
  });

  it('should allow the theworddersDAO to unpause the contract and create the first offering', async () => {
    const tx = await thewordOfferingHouse.unpause();
    await tx.wait();

    const offering = await thewordOfferingHouse.offering();
    expect(offering.startTime.toNumber()).to.be.greaterThan(0);
  });

  it('should revert if a user creates a bid for an inactive offering', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();
    const tx = thewordOfferingHouse.connect(bidderA).createBid(thewordId.add(1), {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('TheWord not up for offering');
  });

  it('should revert if a user creates a bid for an expired offering', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

    const { thewordId } = await thewordOfferingHouse.offering();
    const tx = thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('Offering expired');
  });

  it('should revert if a user creates a bid with an amount below the reserve price', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();
    const tx = thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE - 1,
    });

    await expect(tx).to.be.revertedWith('Must send at least reservePrice');
  });

  it('should revert if a user creates a bid less than the min bid increment percentage', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();
    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE * 50,
    });
    const tx = thewordOfferingHouse.connect(bidderB).createBid(thewordId, {
      value: RESERVE_PRICE * 51,
    });

    await expect(tx).to.be.revertedWith(
      'Must send more than last bid by minBidIncrementPercentage amount',
    );
  });

  it('should refund the previous bidder when the following user creates a bid', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();
    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    const bidderAPostBidBalance = await bidderA.getBalance();
    await thewordOfferingHouse.connect(bidderB).createBid(thewordId, {
      value: RESERVE_PRICE * 2,
    });
    const bidderAPostRefundBalance = await bidderA.getBalance();

    expect(bidderAPostRefundBalance).to.equal(bidderAPostBidBalance.add(RESERVE_PRICE));
  });

  it('should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WETH', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    const maliciousBidderFactory = new MaliciousBidderFactory(bidderA);
    const maliciousBidder = await maliciousBidderFactory.deploy();

    const maliciousBid = await maliciousBidder
      .connect(bidderA)
      .bid(thewordOfferingHouse.address, thewordId, {
        value: RESERVE_PRICE,
      });
    await maliciousBid.wait();

    const tx = await thewordOfferingHouse.connect(bidderB).createBid(thewordId, {
      value: RESERVE_PRICE * 2,
      gasLimit: 1_000_000,
    });
    const result = await tx.wait();

    expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
    expect(await weth.balanceOf(maliciousBidder.address)).to.equal(RESERVE_PRICE);
  });

  it('should emit an `OfferingBid` event on a successful bid', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();
    const tx = thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await expect(tx)
      .to.emit(thewordOfferingHouse, 'OfferingBid')
      .withArgs(thewordId, bidderA.address, RESERVE_PRICE, false);
  });

  it('should emit an `OfferingExtended` event if the offering end time is within the time buffer', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId, endTime } = await thewordOfferingHouse.offering();

    await ethers.provider.send('evm_setNextBlockTimestamp', [endTime.sub(60 * 5).toNumber()]); // Subtract 5 mins from current end time

    const tx = thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await expect(tx)
      .to.emit(thewordOfferingHouse, 'OfferingExtended')
      .withArgs(thewordId, endTime.add(60 * 10));
  });

  it('should revert if offering settlement is attempted while the offering is still active', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });
    const tx = thewordOfferingHouse.connect(bidderA).settleCurrentAndCreateNewOffering();

    await expect(tx).to.be.revertedWith("Offering hasn't completed");
  });

  it('should emit `OfferingSettled` and `OfferingCreated` events if all conditions are met', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours
    const tx = await thewordOfferingHouse.connect(bidderA).settleCurrentAndCreateNewOffering();

    const receipt = await tx.wait();
    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

    const settledEvent = receipt.events?.find((e) => e.event === 'OfferingSettled');
    const createdEvent = receipt.events?.find((e) => e.event === 'OfferingCreated');

    expect(settledEvent?.args?.thewordId).to.equal(thewordId);
    expect(settledEvent?.args?.winner).to.equal(bidderA.address);
    expect(settledEvent?.args?.amount).to.equal(RESERVE_PRICE);

    expect(createdEvent?.args?.thewordId).to.equal(thewordId.add(1));
    expect(createdEvent?.args?.startTime).to.equal(timestamp);
    expect(createdEvent?.args?.endTime).to.equal(timestamp + DURATION);
  });

  it('should not create a new offering if the offering house is paused and unpaused while an offering is ongoing', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    await (await thewordOfferingHouse.pause()).wait();

    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    expect(thewordId).to.equal(1);
  });

  it('should create a new offering if the offering house is paused and unpaused after an offering is settled', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

    await (await thewordOfferingHouse.pause()).wait();

    const settleTx = thewordOfferingHouse.connect(bidderA).settleOffering();

    await expect(settleTx)
      .to.emit(thewordOfferingHouse, 'OfferingSettled')
      .withArgs(thewordId, bidderA.address, RESERVE_PRICE);

    const unpauseTx = await thewordOfferingHouse.unpause();
    const receipt = await unpauseTx.wait();
    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

    const createdEvent = receipt.events?.find((e) => e.event === 'OfferingCreated');

    expect(createdEvent?.args?.thewordId).to.equal(thewordId.add(1));
    expect(createdEvent?.args?.startTime).to.equal(timestamp);
    expect(createdEvent?.args?.endTime).to.equal(timestamp + DURATION);
  });

  it('should settle the current offering and pause the contract if the minter is updated while the offering house is unpaused', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    await thewordOfferingHouse.connect(bidderA).createBid(thewordId, {
      value: RESERVE_PRICE,
    });

    await thewordToken.setMinter(constants.AddressZero);

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

    const settleTx = thewordOfferingHouse.connect(bidderA).settleCurrentAndCreateNewOffering();

    await expect(settleTx)
      .to.emit(thewordOfferingHouse, 'OfferingSettled')
      .withArgs(thewordId, bidderA.address, RESERVE_PRICE);

    const paused = await thewordOfferingHouse.paused();

    expect(paused).to.equal(true);
  });

  it('should burn a TheWord on offering settlement if no bids are received', async () => {
    await (await thewordOfferingHouse.unpause()).wait();

    const { thewordId } = await thewordOfferingHouse.offering();

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

    const tx = thewordOfferingHouse.connect(bidderA).settleCurrentAndCreateNewOffering();

    await expect(tx)
      .to.emit(thewordOfferingHouse, 'OfferingSettled')
      .withArgs(thewordId, '0x0000000000000000000000000000000000000000', 0);
  });
});
