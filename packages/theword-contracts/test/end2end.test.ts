import chai from 'chai';
import { ethers, upgrades } from 'hardhat';
import { BigNumber as EthersBN } from 'ethers';
import { solidity } from 'ethereum-waffle';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  Weth,
  thewordToken,
  thewordOfferingHouse,
  thewordOfferingHouse__factory as thewordOfferingHouseFactory,
  thewordDescriptor,
  thewordDescriptor__factory as thewordDescriptorFactory,
  thewordDaoProxy__factory as thewordDaoProxyFactory,
  thewordDaoLogicV1,
  thewordDaoLogicV1__factory as thewordDaoLogicV1Factory,
  thewordDaoExecutor,
  thewordDaoExecutor__factory as thewordDaoExecutorFactory,
} from '../typechain';

import {
  deploythewordToken,
  deployWeth,
  populateDescriptor,
  address,
  encodeParameters,
  advanceBlocks,
  blockTimestamp,
  setNextBlockTimestamp,
} from './utils';

chai.use(solidity);
const { expect } = chai;

let thewordToken: thewordToken;
let thewordOfferingHouse: thewordOfferingHouse;
let descriptor: thewordDescriptor;
let weth: Weth;
let gov: thewordDaoLogicV1;
let timelock: thewordDaoExecutor;

let deployer: SignerWithAddress;
let wethDeployer: SignerWithAddress;
let bidderA: SignerWithAddress;
let theworddersDAO: SignerWithAddress;

// Governance Config
const TIME_LOCK_DELAY = 172_800; // 2 days
const PROPOSAL_THRESHOLD_BPS = 500; // 5%
const QUORUM_VOTES_BPS = 1_000; // 10%
const VOTING_PERIOD = 5_760; // About 24 hours with 15s blocks
const VOTING_DELAY = 1; // 1 block

// Proposal Config
const targets: string[] = [];
const values: string[] = [];
const signatures: string[] = [];
const callDatas: string[] = [];

let proposalId: EthersBN;

// Offering House Config
const TIME_BUFFER = 15 * 60;
const RESERVE_PRICE = 2;
const MIN_INCREMENT_BID_PERCENTAGE = 5;
const DURATION = 60 * 60 * 24;

async function deploy() {
  [deployer, bidderA, wethDeployer, theworddersDAO] = await ethers.getSigners();

  // Deployed by another account to simulate real network

  weth = await deployWeth(wethDeployer);

  // nonce 2: Deploy OfferingHouse
  // nonce 3: Deploy nftDescriptorLibraryFactory
  // nonce 4: Deploy thewordDescriptor
  // nonce 5: Deploy thewordSeeder
  // nonce 6: Deploy thewordToken
  // nonce 0: Deploy thewordDAOExecutor
  // nonce 1: Deploy thewordDAOLogicV1
  // nonce 7: Deploy thewordDAOProxy
  // nonce ++: populate Descriptor
  // nonce ++: set ownable contracts owner to timelock

  // 1. DEPLOY theword token
  thewordToken = await deploythewordToken(
    deployer,
    theworddersDAO.address,
    deployer.address, // do not know minter/offering house yet
  );

  // 2a. DEPLOY OfferingHouse
  const offeringHouseFactory = await ethers.getContractFactory('thewordOfferingHouse', deployer);
  const thewordOfferingHouseProxy = await upgrades.deployProxy(offeringHouseFactory, [
    thewordToken.address,
    weth.address,
    TIME_BUFFER,
    RESERVE_PRICE,
    MIN_INCREMENT_BID_PERCENTAGE,
    DURATION,
  ]);

  // 2b. CAST proxy as OfferingHouse
  thewordOfferingHouse = thewordOfferingHouseFactory.connect(thewordOfferingHouseProxy.address, deployer);

  // 3. SET MINTER
  await thewordToken.setMinter(thewordOfferingHouse.address);

  // 4. POPULATE body parts
  descriptor = thewordDescriptorFactory.connect(await thewordToken.descriptor(), deployer);

  await populateDescriptor(descriptor);

  // 5a. CALCULATE Gov Delegate, takes place after 2 transactions
  const calculatedGovDelegatorAddress = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: (await deployer.getTransactionCount()) + 2,
  });

  // 5b. DEPLOY thewordDAOExecutor with pre-computed Delegator address
  timelock = await new thewordDaoExecutorFactory(deployer).deploy(
    calculatedGovDelegatorAddress,
    TIME_LOCK_DELAY,
  );

  // 6. DEPLOY Delegate
  const govDelegate = await new thewordDaoLogicV1Factory(deployer).deploy();

  // 7a. DEPLOY Delegator
  const thewordDAOProxy = await new thewordDaoProxyFactory(deployer).deploy(
    timelock.address,
    thewordToken.address,
    theworddersDAO.address, // TheWorddersDAO is vetoer
    timelock.address,
    govDelegate.address,
    VOTING_PERIOD,
    VOTING_DELAY,
    PROPOSAL_THRESHOLD_BPS,
    QUORUM_VOTES_BPS,
  );

  expect(calculatedGovDelegatorAddress).to.equal(thewordDAOProxy.address);

  // 7b. CAST Delegator as Delegate
  gov = thewordDaoLogicV1Factory.connect(thewordDAOProxy.address, deployer);

  // 8. SET theword owner to thewordDAOExecutor
  await thewordToken.transferOwnership(timelock.address);
  // 9. SET Descriptor owner to thewordDAOExecutor
  await descriptor.transferOwnership(timelock.address);

  // 10. UNPAUSE offering and kick off first mint
  await thewordOfferingHouse.unpause();

  // 11. SET Offering House owner to thewordDAOExecutor
  await thewordOfferingHouse.transferOwnership(timelock.address);
}

describe('End to End test with deployment, offering, proposing, voting, executing', async () => {
  before(deploy);

  it('sets all starting params correctly', async () => {
    expect(await thewordToken.owner()).to.equal(timelock.address);
    expect(await descriptor.owner()).to.equal(timelock.address);
    expect(await thewordOfferingHouse.owner()).to.equal(timelock.address);

    expect(await thewordToken.minter()).to.equal(thewordOfferingHouse.address);
    expect(await thewordToken.theworddersDAO()).to.equal(theworddersDAO.address);

    expect(await gov.admin()).to.equal(timelock.address);
    expect(await timelock.admin()).to.equal(gov.address);
    expect(await gov.timelock()).to.equal(timelock.address);

    expect(await gov.vetoer()).to.equal(theworddersDAO.address);

    expect(await thewordToken.totalSupply()).to.equal(EthersBN.from('2'));

    expect(await thewordToken.ownerOf(0)).to.equal(theworddersDAO.address);
    expect(await thewordToken.ownerOf(1)).to.equal(thewordOfferingHouse.address);

    expect((await thewordOfferingHouse.offering()).thewordId).to.equal(EthersBN.from('1'));
  });

  it('allows bidding, settling, and transferring ETH correctly', async () => {
    await thewordOfferingHouse.connect(bidderA).createBid(1, { value: RESERVE_PRICE });
    await setNextBlockTimestamp(Number(await blockTimestamp('latest')) + DURATION);
    await thewordOfferingHouse.settleCurrentAndCreateNewOffering();

    expect(await thewordToken.ownerOf(1)).to.equal(bidderA.address);
    expect(await ethers.provider.getBalance(timelock.address)).to.equal(RESERVE_PRICE);
  });

  it('allows proposing, voting, queuing', async () => {
    const description = 'Set thewordToken minter to address(1) and transfer treasury to address(2)';

    // Action 1. Execute thewordToken.setMinter(address(1))
    targets.push(thewordToken.address);
    values.push('0');
    signatures.push('setMinter(address)');
    callDatas.push(encodeParameters(['address'], [address(1)]));

    // Action 2. Execute transfer RESERVE_PRICE to address(2)
    targets.push(address(2));
    values.push(String(RESERVE_PRICE));
    signatures.push('');
    callDatas.push('0x');

    await gov.connect(bidderA).propose(targets, values, signatures, callDatas, description);

    proposalId = await gov.latestProposalIds(bidderA.address);

    // Wait for VOTING_DELAY
    await advanceBlocks(VOTING_DELAY + 1);

    // cast vote for proposal
    await gov.connect(bidderA).castVote(proposalId, 1);

    await advanceBlocks(VOTING_PERIOD);

    await gov.connect(bidderA).queue(proposalId);

    // Queued state
    expect(await gov.state(proposalId)).to.equal(5);
  });

  it('executes proposal transactions correctly', async () => {
    const { eta } = await gov.proposals(proposalId);
    await setNextBlockTimestamp(eta.toNumber(), false);
    await gov.execute(proposalId);

    // Successfully executed Action 1
    expect(await thewordToken.minter()).to.equal(address(1));

    // Successfully executed Action 2
    expect(await ethers.provider.getBalance(address(2))).to.equal(RESERVE_PRICE);
  });

  it('does not allow thewordDAO to accept funds', async () => {
    let error1;

    // thewordDAO does not accept value without calldata
    try {
      await bidderA.sendTransaction({
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error1 = e;
    }

    expect(error1);

    let error2;

    // thewordDAO does not accept value with calldata
    try {
      await bidderA.sendTransaction({
        data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error2 = e;
    }

    expect(error2);
  });

  it('allows thewordDAOExecutor to receive funds', async () => {
    // test receive()
    await bidderA.sendTransaction({
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(10);

    // test fallback() calls deposit(uint) which is not implemented
    await bidderA.sendTransaction({
      data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(20);
  });
});
