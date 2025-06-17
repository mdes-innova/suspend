import { DocumentType } from '@/components/document-list/document-list';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentListUiState {
  data: DocumentType[]
  yPos: number
  dragId: string,
  isDragging: boolean
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
  isDragging: false
};

// Create the slice
const documentListUiSlice = createSlice({
  name: 'document-list',
  initialState,
  reducers: {
    setData(state, action: PayloadAction<DocumentType[]>) {
      state.data = action.payload;
    },
    setDragging(state, action: PayloadAction<IsDraggingState>) {
      state.isDragging = action.payload.isDragging;
      state.yPos = action.payload.yPos;
      state.dragId= action.payload.dragId;
    }
  },
});

// Export actions and reducer
export const {
  setData, setDragging 
} = documentListUiSlice.actions;

export default documentListUiSlice.reducer;
