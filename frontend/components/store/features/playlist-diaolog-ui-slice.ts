import { toast } from "sonner";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum PLAYLISTUI  {
  list,
  new,
};

type Payload = {
  ui: PLAYLISTUI,
  info?: string[],
  err?: boolean
}

interface UIState {
  listOpen: boolean;
  newOpen: boolean;
  dataChanged: boolean;
  docIds: null | number[]
}

const initialState: UIState = {
  listOpen: false,
  newOpen: false,
  docIds: null,
  dataChanged: false
};

const playlistDialogUiSlice = createSlice({
  name: 'playlist-dialog-ui',
  initialState,
  reducers: {
    setDocIds(state: UIState, action: PayloadAction<number[] | null>) {
      state.docIds = action.payload? action.payload: null;
    },
    toggleModal(state: UIState, action: PayloadAction<Payload>) {
      if (action.payload.ui === PLAYLISTUI.list) state.listOpen = !state.listOpen;
      else if (action.payload.ui === PLAYLISTUI.new) state.newOpen = !state.newOpen;
    },
    openModal(state: UIState, action: PayloadAction<Payload>) {
      if (action.payload.ui === PLAYLISTUI.list) state.listOpen = true;
      else if (action.payload.ui === PLAYLISTUI.new) state.newOpen = true;
    },
    closeModal(state: UIState, action: PayloadAction<Payload>) {
      if (action.payload.ui === PLAYLISTUI.list) state.listOpen = false;
      else if (action.payload.ui === PLAYLISTUI.new) state.newOpen = false;

      if (action.payload.ui === PLAYLISTUI.new) {
        if (Object.keys(action.payload).includes("err") && action.payload.info?.length) {
          toast("Error detected", {
            description: `Error: ${action.payload.info[0]}`});
        } else {
          if (action.payload.info?.length) {
            if (action.payload.info.length == 1) 
              toast(action.payload.info[0], {
                description: 'สร้างฉบับร่างใหม่สำเร็จ'});
            else
                Array.from({length: action.payload.info.length - 1}).forEach((_, idx: number) => {
                  if (action.payload.info)
                    toast("ฉบับร่าง \"" + action.payload.info[0] + "\"", {
                      description: "เพิ่ม " + action.payload.info[idx + 1]
                    });
                });
          }
          state.dataChanged = true;
        }
      } else {
        if (Object.keys(action.payload).includes("err") && action.payload.info?.length) {
          toast("Error detected", {
            description: `Error: ${action.payload.info[0]}`});
        } else {
          if (action.payload.info?.length) {
            if (action.payload.info.length == 1) 
              toast(action.payload.info[0], {
                description: 'สร้างฉบับร่างใหม่สำเร็จ'});
            else
                Array.from({length: action.payload.info.length - 1}).forEach((_, idx: number) => {
                  if (action.payload.info)
                    toast("ฉบับบร่าง \"" + action.payload.info[0] + "\"", {
                      description: "เพิ่ม " + action.payload.info[idx + 1]
                    });
                });
            state.dataChanged = true;
          }
        }
      }
    },
  },
});

export const { toggleModal, openModal, closeModal, setDocIds } = playlistDialogUiSlice.actions;
export default playlistDialogUiSlice.reducer;