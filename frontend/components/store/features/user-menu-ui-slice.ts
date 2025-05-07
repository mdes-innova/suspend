import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  modalOpen: boolean;
}

const initialState: UIState = {
  modalOpen: false,
};

const userMenuUiSlice = createSlice({
  name: 'user-menu-ui',
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

export const { toggleModal, openModal, closeModal } = userMenuUiSlice.actions;
export default userMenuUiSlice.reducer;