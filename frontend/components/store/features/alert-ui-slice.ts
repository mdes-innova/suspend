import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ALERTUI {
  successful_register,
  fail_register,
  successful_groupsave,
  fail_groupsave
};

interface UIState {
    modalOpen: boolean,
    ui: ALERTUI | null
}

const initialState: UIState = {
    modalOpen: false,
    ui: null
}

const alertUiSlice = createSlice({
    name: 'alert-ui',
    initialState,
    reducers: {
        openModal(state: UIState, action: PayloadAction<ALERTUI>){
            state.modalOpen = true;
            state.ui = action.payload;
        },
        closeModal(state: UIState){
            state.modalOpen = false;
            state.ui = null;
        },
        toggleModal(state: UIState, action: PayloadAction<ALERTUI>){
            state.modalOpen = !(state.modalOpen);
            state.ui = action.payload;
        },
    }
});

export const { openModal, closeModal, toggleModal } = alertUiSlice.actions;
export default alertUiSlice.reducer;