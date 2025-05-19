import { toast } from "sonner";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  modalOpen: boolean;
}

const initialState: UIState = {
  modalOpen: false,
};

const playlistDialogUiSlice = createSlice({
  name: 'playlist-dialog-ui',
  initialState,
  reducers: {
    toggleModal(state: UIState) {
      state.modalOpen = !state.modalOpen;
    },
    openModal(state: UIState) {
      state.modalOpen = true;
    },
    closeModal(state: UIState, action: PayloadAction<string[] | undefined>) {
      state.modalOpen = false;
      if (action.payload) {
        toast("Event has been created", {
          description: action.payload.length? "Sunday, December 03, 2023 at 9:00 AM":
            action.payload.length < 3? action.payload[0] + " " + action.payload[0]:
            action.payload[0],
        })
      }
    },
  },
});

export const { toggleModal, openModal, closeModal } = playlistDialogUiSlice.actions;
export default playlistDialogUiSlice.reducer;