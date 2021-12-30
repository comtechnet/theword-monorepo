import { BigNumber } from '@ethersproject/bignumber';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  OfferingCreateEvent,
  OfferingExtendedEvent,
  OfferingSettledEvent,
  BidEvent,
} from '../../utils/types';
import { Offering as IOffering } from '../../wrappers/thewordOffering';

export interface OfferingState {
  activeOffering?: IOffering;
  bids: BidEvent[];
}

const initialState: OfferingState = {
  activeOffering: undefined,
  bids: [],
};

export const reduxSafeNewOffering = (offering: OfferingCreateEvent): IOffering => ({
  amount: BigNumber.from(0).toJSON(),
  bidder: '',
  startTime: BigNumber.from(offering.startTime).toJSON(),
  endTime: BigNumber.from(offering.endTime).toJSON(),
  thewordId: BigNumber.from(offering.thewordId).toJSON(),
  settled: false,
});

export const reduxSafeOffering = (offering: IOffering): IOffering => ({
  amount: BigNumber.from(offering.amount).toJSON(),
  bidder: offering.bidder,
  startTime: BigNumber.from(offering.startTime).toJSON(),
  endTime: BigNumber.from(offering.endTime).toJSON(),
  thewordId: BigNumber.from(offering.thewordId).toJSON(),
  settled: offering.settled,
});

export const reduxSafeBid = (bid: BidEvent): BidEvent => ({
  thewordId: BigNumber.from(bid.thewordId).toJSON(),
  sender: bid.sender,
  value: BigNumber.from(bid.value).toJSON(),
  extended: bid.extended,
  transactionHash: bid.transactionHash,
  timestamp: bid.timestamp,
});

const maxBid = (bids: BidEvent[]): BidEvent => {
  return bids.reduce((prev, current) => {
    return BigNumber.from(prev.value).gt(BigNumber.from(current.value)) ? prev : current;
  });
};

const offeringsEqual = (
  a: IOffering,
  b: OfferingSettledEvent | OfferingCreateEvent | BidEvent | OfferingExtendedEvent,
) => BigNumber.from(a.thewordId).eq(BigNumber.from(b.thewordId));

const containsBid = (bidEvents: BidEvent[], bidEvent: BidEvent) =>
  bidEvents.map(bid => bid.transactionHash).indexOf(bidEvent.transactionHash) >= 0;

/**
 * State of **current** offering (sourced via websocket)
 */
export const offeringSlice = createSlice({
  name: 'offering',
  initialState,
  reducers: {
    setActiveOffering: (state, action: PayloadAction<OfferingCreateEvent>) => {
      state.activeOffering = reduxSafeNewOffering(action.payload);
      state.bids = [];
      console.log('processed offering create', action.payload);
    },
    setFullOffering: (state, action: PayloadAction<IOffering>) => {
      console.log(`from set full offering: `, action.payload);
      state.activeOffering = reduxSafeOffering(action.payload);
    },
    appendBid: (state, action: PayloadAction<BidEvent>) => {
      if (!(state.activeOffering && offeringsEqual(state.activeOffering, action.payload))) return;
      if (containsBid(state.bids, action.payload)) return;
      state.bids = [reduxSafeBid(action.payload), ...state.bids];
      const maxBid_ = maxBid(state.bids);
      state.activeOffering.amount = BigNumber.from(maxBid_.value).toJSON();
      state.activeOffering.bidder = maxBid_.sender;
      console.log('processed bid', action.payload);
    },
    setOfferingSettled: (state, action: PayloadAction<OfferingSettledEvent>) => {
      if (!(state.activeOffering && offeringsEqual(state.activeOffering, action.payload))) return;
      state.activeOffering.settled = true;
      state.activeOffering.bidder = action.payload.winner;
      state.activeOffering.amount = BigNumber.from(action.payload.amount).toJSON();
      console.log('processed offering settled', action.payload);
    },
    setOfferingExtended: (state, action: PayloadAction<OfferingExtendedEvent>) => {
      if (!(state.activeOffering && offeringsEqual(state.activeOffering, action.payload))) return;
      state.activeOffering.endTime = BigNumber.from(action.payload.endTime).toJSON();
      console.log('processed offering extended', action.payload);
    },
  },
});

export const {
  setActiveOffering,
  appendBid,
  setOfferingExtended,
  setOfferingSettled,
  setFullOffering,
} = offeringSlice.actions;

export default offeringSlice.reducer;
