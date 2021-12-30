import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfferingState } from './offering';
import { BigNumber } from '@ethersproject/bignumber';

interface PastOfferingsState {
  pastOfferings: OfferingState[];
}

const initialState: PastOfferingsState = {
  pastOfferings: [],
};

const reduxSafePastOfferings = (data: any): OfferingState[] => {
  const offerings = data.data.offerings as any[];
  if (offerings.length < 0) return [];
  const pastOfferings: OfferingState[] = offerings.map(offering => {
    return {
      activeOffering: {
        amount: BigNumber.from(offering.amount).toJSON(),
        bidder: offering.bidder ? offering.bidder.id : '',
        startTime: BigNumber.from(offering.startTime).toJSON(),
        endTime: BigNumber.from(offering.endTime).toJSON(),
        thewordId: BigNumber.from(offering.id).toJSON(),
        settled: false,
      },
      bids: offering.bids.map((bid: any) => {
        return {
          thewordId: BigNumber.from(offering.id).toJSON(),
          sender: bid.bidder.id,
          value: BigNumber.from(bid.amount).toJSON(),
          extended: false,
          transactionHash: bid.id,
          timestamp: BigNumber.from(bid.blockTimestamp).toJSON(),
        };
      }),
    };
  });
  return pastOfferings;
};

const pastOfferingsSlice = createSlice({
  name: 'pastOfferings',
  initialState: initialState,
  reducers: {
    addPastOfferings: (state, action: PayloadAction<any>) => {
      state.pastOfferings = reduxSafePastOfferings(action.payload);
    },
  },
});

export const { addPastOfferings } = pastOfferingsSlice.actions;

export default pastOfferingsSlice.reducer;
