import { Auction } from '../wrappers/thewordAuction';
import { AuctionState } from '../state/slices/auction';
import { BigNumber } from '@ethersproject/bignumber';

export const isTheWordderTheWord = (thewordId: BigNumber) => {
  return thewordId.mod(10).eq(0) || thewordId.eq(0);
};

const emptyTheWordderAuction = (onDisplayAuctionId: number): Auction => {
  return {
    amount: BigNumber.from(0).toJSON(),
    bidder: '',
    startTime: BigNumber.from(0).toJSON(),
    endTime: BigNumber.from(0).toJSON(),
    thewordId: BigNumber.from(onDisplayAuctionId).toJSON(),
    settled: false,
  };
};

const findAuction = (id: BigNumber, auctions: AuctionState[]): Auction | undefined => {
  return auctions.find(auction => {
    return BigNumber.from(auction.activeAuction?.thewordId).eq(id);
  })?.activeAuction;
};

/**
 *
 * @param thewordId
 * @param pastAuctions
 * @returns empty `Auction` object with `startTime` set to auction after param `thewordId`
 */
export const generateEmptyTheWordderAuction = (
  thewordId: BigNumber,
  pastAuctions: AuctionState[],
): Auction => {
  const thewordderAuction = emptyTheWordderAuction(thewordId.toNumber());
  // use thewordderAuction.thewordId + 1 to get mint time
  const auctionAbove = findAuction(thewordId.add(1), pastAuctions);
  const auctionAboveStartTime = auctionAbove && BigNumber.from(auctionAbove.startTime);
  if (auctionAboveStartTime) thewordderAuction.startTime = auctionAboveStartTime.toJSON();

  return thewordderAuction;
};
