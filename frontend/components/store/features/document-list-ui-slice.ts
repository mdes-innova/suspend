import { type Document } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentListUiState {
  data: Document[]
  yPos: number
  dragId: string,
  isDragging: boolean,
  dataChanged: boolean
}

interface IsDraggingState {
  yPos: number
  dragId: string
  isDragging: boolean
}

const initialState: DocumentListUiState = {
  data: [],
  yPos: 0,
  dragId: "",
  isDragging: false,
  dataChanged: false
};

// Create the slice
const documentListUiSlice = createSlice({
  name: 'document-list',
  initialState,
  reducers: {
    setData(state: DocumentListUiState, action: PayloadAction<Document[]>) {
      state.data = action.payload;
    },
    setDragging(state: DocumentListUiState, action: PayloadAction<IsDraggingState>) {
      state.isDragging = action.payload.isDragging;
      state.yPos = action.payload.yPos;
      state.dragId= action.payload.dragId;
    },
    toggleDataChanged(state: DocumentListUiState) {
      state.dataChanged = !state.dataChanged;
    }

  },
});

// Export actions and reducer
export const {
  setData, setDragging, toggleDataChanged
} = documentListUiSlice.actions;

export default documentListUiSlice.reducer;
