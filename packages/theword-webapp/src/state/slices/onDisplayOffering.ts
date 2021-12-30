import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnDisplayOfferingState {
  lastOfferingTheWordId: number | undefined;
  onDisplayOfferingTheWordId: number | undefined;
}

const initialState: OnDisplayOfferingState = {
  lastOfferingTheWordId: undefined,
  onDisplayOfferingTheWordId: undefined,
};

const onDisplayOffering = createSlice({
  name: 'onDisplayOffering',
  initialState: initialState,
  reducers: {
    setLastOfferingTheWordId: (state, action: PayloadAction<number>) => {
      state.lastOfferingTheWordId = action.payload;
    },
    setOnDisplayOfferingTheWordId: (state, action: PayloadAction<number>) => {
      state.onDisplayOfferingTheWordId = action.payload;
    },
    setPrevOnDisplayOfferingTheWordId: state => {
      if (!state.onDisplayOfferingTheWordId) return;
      if (state.onDisplayOfferingTheWordId === 0) return;
      state.onDisplayOfferingTheWordId = state.onDisplayOfferingTheWordId - 1;
    },
    setNextOnDisplayOfferingTheWordId: state => {
      if (state.onDisplayOfferingTheWordId === undefined) return;
      if (state.lastOfferingTheWordId === state.onDisplayOfferingTheWordId) return;
      state.onDisplayOfferingTheWordId = state.onDisplayOfferingTheWordId + 1;
    },
  },
});

export const {
  setLastOfferingTheWordId,
  setOnDisplayOfferingTheWordId,
  setPrevOnDisplayOfferingTheWordId,
  setNextOnDisplayOfferingTheWordId,
} = onDisplayOffering.actions;

export default onDisplayOffering.reducer;
