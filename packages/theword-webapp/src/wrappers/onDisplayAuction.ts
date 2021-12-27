import { BigNumber } from '@ethersproject/bignumber';
import { useAppSelector } from '../hooks';
import { generateEmptyTheWordderAuction, isTheWordderTheWord } from '../utils/thewordderTheWord';
import { Bid, BidEvent } from '../utils/types';
import { Auction } from './thewordAuction';

const deserializeAuction = (reduxSafeAuction: Auction): Auction => {
  return {
    amount: BigNumber.from(reduxSafeAuction.amount),
    bidder: reduxSafeAuction.bidder,
    startTime: BigNumber.from(reduxSafeAuction.startTime),
    endTime: BigNumber.from(reduxSafeAuction.endTime),
    thewordId: BigNumber.from(reduxSafeAuction.thewordId),
    settled: false,
  };
};

const deserializeBid = (reduxSafeBid: BidEvent): Bid => {
  return {
    thewordId: BigNumber.from(reduxSafeBid.thewordId),
    sender: reduxSafeBid.sender,
    value: BigNumber.from(reduxSafeBid.value),
    extended: reduxSafeBid.extended,
    transactionHash: reduxSafeBid.transactionHash,
    timestamp: BigNumber.from(reduxSafeBid.timestamp),
  };
};
const deserializeBids = (reduxSafeBids: BidEvent[]): Bid[] => {
  return reduxSafeBids
    .map(bid => deserializeBid(bid))
    .sort((a: Bid, b: Bid) => {
      return b.timestamp.toNumber() - a.timestamp.toNumber();
    });
};

const useOnDisplayAuction = (): Auction | undefined => {
  const lastAuctionTheWordId = useAppSelector(state => state.auction.activeAuction?.thewordId);
  const onDisplayAuctionTheWordId = useAppSelector(
    state => state.onDisplayAuction.onDisplayAuctionTheWordId,
  );
  const currentAuction = useAppSelector(state => state.auction.activeAuction);
  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);

  if (
    onDisplayAuctionTheWordId === undefined ||
    lastAuctionTheWordId === undefined ||
    currentAuction === undefined ||
    !pastAuctions
  )
    return undefined;

  // current auction
  if (BigNumber.from(onDisplayAuctionTheWordId).eq(lastAuctionTheWordId)) {
    return deserializeAuction(currentAuction);
  } else {
    // thewordder auction
    if (isTheWordderTheWord(BigNumber.from(onDisplayAuctionTheWordId))) {
      const emptyTheWordderAuction = generateEmptyTheWordderAuction(
        BigNumber.from(onDisplayAuctionTheWordId),
        pastAuctions,
      );

      return deserializeAuction(emptyTheWordderAuction);
    } else {
      // past auction
      const reduxSafeAuction: Auction | undefined = pastAuctions.find(auction => {
        const thewordId = auction.activeAuction && BigNumber.from(auction.activeAuction.thewordId);
        return thewordId && thewordId.toNumber() === onDisplayAuctionTheWordId;
      })?.activeAuction;

      return reduxSafeAuction ? deserializeAuction(reduxSafeAuction) : undefined;
    }
  }
};

export const useAuctionBids = (auctionTheWordId: BigNumber): Bid[] | undefined => {
  const lastAuctionTheWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionTheWordId);
  const lastAuctionBids = useAppSelector(state => state.auction.bids);
  const pastAuctions = useAppSelector(state => state.pastAuctions.pastAuctions);

  // auction requested is active auction
  if (lastAuctionTheWordId === auctionTheWordId.toNumber()) {
    return deserializeBids(lastAuctionBids);
  } else {
    // find bids for past auction requested
    const bidEvents: BidEvent[] | undefined = pastAuctions.find(auction => {
      const thewordId = auction.activeAuction && BigNumber.from(auction.activeAuction.thewordId);
      return thewordId && thewordId.eq(auctionTheWordId);
    })?.bids;

    return bidEvents && deserializeBids(bidEvents);
  }
};

export default useOnDisplayAuction;
