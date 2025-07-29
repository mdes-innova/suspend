import { type Document } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

// Define the shape of the table state
interface GroupListtUiState {
  dataChanged: boolean
}

// Initial state with type annotation
const initialState: GroupListtUiState = {
  dataChanged: false
};

// Create the slice
const GroupListUiSlice = createSlice({
  name: 'grouplist',
  initialState,
  reducers: {
    toggleDataChanged(state: GroupListtUiState) {
      state.dataChanged = !state.dataChanged;
    }
  },
});

// Export actions and reducer
export const {
  toggleDataChanged
} = GroupListUiSlice.actions;

export default GroupListUiSlice.reducer;
