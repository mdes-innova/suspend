import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  modalOpen: boolean;
}

const initialState: UIState = {
  modalOpen: false,
};

const passwordResetUiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleModal(state: UIState) {
      state.modalOpen = !state.modalOpen;
    },
    openModal(state: UIState) {
      state.modalOpen = true;
    },
    closeModal(state: UIState) {
      state.modalOpen = false;
    },
  },
});

export const { toggleModal, openModal, closeModal } = passwordResetUiSlice.actions;
export default passwordResetUiSlice.reducer;