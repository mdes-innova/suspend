import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum LOADINGUI  {
  dialog,
};

type Payload = {
  ui: LOADINGUI,
}

interface UIState {
  openDialog: boolean;
}

const initialState: UIState = {
    openDialog: false
};

const loadingUiSlice = createSlice({
  name: 'loading-ui',
  initialState,
  reducers: {
    openModal(state: UIState, action: PayloadAction<Payload>) {
      if (action.payload.ui === LOADINGUI.dialog) state.openDialog = true;
    },
    closeModal(state: UIState, action: PayloadAction<Payload>) {
      if (action.payload.ui === LOADINGUI.dialog) state.openDialog = false;
    }
  },
});

export const { openModal, closeModal } = loadingUiSlice.actions;
export default loadingUiSlice.reducer;