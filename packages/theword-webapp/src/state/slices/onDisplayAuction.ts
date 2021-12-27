import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnDisplayAuctionState {
  lastAuctionTheWordId: number | undefined;
  onDisplayAuctionTheWordId: number | undefined;
}

const initialState: OnDisplayAuctionState = {
  lastAuctionTheWordId: undefined,
  onDisplayAuctionTheWordId: undefined,
};

const onDisplayAuction = createSlice({
  name: 'onDisplayAuction',
  initialState: initialState,
  reducers: {
    setLastAuctionTheWordId: (state, action: PayloadAction<number>) => {
      state.lastAuctionTheWordId = action.payload;
    },
    setOnDisplayAuctionTheWordId: (state, action: PayloadAction<number>) => {
      state.onDisplayAuctionTheWordId = action.payload;
    },
    setPrevOnDisplayAuctionTheWordId: state => {
      if (!state.onDisplayAuctionTheWordId) return;
      if (state.onDisplayAuctionTheWordId === 0) return;
      state.onDisplayAuctionTheWordId = state.onDisplayAuctionTheWordId - 1;
    },
    setNextOnDisplayAuctionTheWordId: state => {
      if (state.onDisplayAuctionTheWordId === undefined) return;
      if (state.lastAuctionTheWordId === state.onDisplayAuctionTheWordId) return;
      state.onDisplayAuctionTheWordId = state.onDisplayAuctionTheWordId + 1;
    },
  },
});

export const {
  setLastAuctionTheWordId,
  setOnDisplayAuctionTheWordId,
  setPrevOnDisplayAuctionTheWordId,
  setNextOnDisplayAuctionTheWordId,
} = onDisplayAuction.actions;

export default onDisplayAuction.reducer;
