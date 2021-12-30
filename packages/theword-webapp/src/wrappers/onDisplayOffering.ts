import { BigNumber } from '@ethersproject/bignumber';
import { useAppSelector } from '../hooks';
import { generateEmptyTheWordderOffering, isTheWordderTheWord } from '../utils/thewordderTheWord';
import { Bid, BidEvent } from '../utils/types';
import { Offering } from './thewordOffering';

const deserializeOffering = (reduxSafeOffering: Offering): Offering => {
  return {
    amount: BigNumber.from(reduxSafeOffering.amount),
    bidder: reduxSafeOffering.bidder,
    startTime: BigNumber.from(reduxSafeOffering.startTime),
    endTime: BigNumber.from(reduxSafeOffering.endTime),
    thewordId: BigNumber.from(reduxSafeOffering.thewordId),
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

const useOnDisplayOffering = (): Offering | undefined => {
  const lastOfferingTheWordId = useAppSelector(state => state.offering.activeOffering?.thewordId);
  const onDisplayOfferingTheWordId = useAppSelector(
    state => state.onDisplayOffering.onDisplayOfferingTheWordId,
  );
  const currentOffering = useAppSelector(state => state.offering.activeOffering);
  const pastOfferings = useAppSelector(state => state.pastOfferings.pastOfferings);

  if (
    onDisplayOfferingTheWordId === undefined ||
    lastOfferingTheWordId === undefined ||
    currentOffering === undefined ||
    !pastOfferings
  )
    return undefined;

  // current offering
  if (BigNumber.from(onDisplayOfferingTheWordId).eq(lastOfferingTheWordId)) {
    return deserializeOffering(currentOffering);
  } else {
    // thewordder offering
    if (isTheWordderTheWord(BigNumber.from(onDisplayOfferingTheWordId))) {
      const emptyTheWordderOffering = generateEmptyTheWordderOffering(
        BigNumber.from(onDisplayOfferingTheWordId),
        pastOfferings,
      );

      return deserializeOffering(emptyTheWordderOffering);
    } else {
      // past offering
      const reduxSafeOffering: Offering | undefined = pastOfferings.find(offering => {
        const thewordId = offering.activeOffering && BigNumber.from(offering.activeOffering.thewordId);
        return thewordId && thewordId.toNumber() === onDisplayOfferingTheWordId;
      })?.activeOffering;

      return reduxSafeOffering ? deserializeOffering(reduxSafeOffering) : undefined;
    }
  }
};

export const useOfferingBids = (offeringTheWordId: BigNumber): Bid[] | undefined => {
  const lastOfferingTheWordId = useAppSelector(state => state.onDisplayOffering.lastOfferingTheWordId);
  const lastOfferingBids = useAppSelector(state => state.offering.bids);
  const pastOfferings = useAppSelector(state => state.pastOfferings.pastOfferings);

  // offering requested is active offering
  if (lastOfferingTheWordId === offeringTheWordId.toNumber()) {
    return deserializeBids(lastOfferingBids);
  } else {
    // find bids for past offering requested
    const bidEvents: BidEvent[] | undefined = pastOfferings.find(offering => {
      const thewordId = offering.activeOffering && BigNumber.from(offering.activeOffering.thewordId);
      return thewordId && thewordId.eq(offeringTheWordId);
    })?.bids;

    return bidEvents && deserializeBids(bidEvents);
  }
};

export default useOnDisplayOffering;
