import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// Define the shape of the table state
interface GroupListtUiState {
  dataChanged: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

// Initial state with type annotation
const initialState: GroupListtUiState = {
  dataChanged: false,
  pagination: {
    pageIndex: 0,
    pageSize: 20,
  },
};

// Create the slice
const GroupListUiSlice = createSlice({
  name: 'grouplist',
  initialState,
  reducers: {
    toggleDataChanged(state: GroupListtUiState) {
      state.dataChanged = !state.dataChanged;
    },
    setPagination(state: GroupListtUiState, action: PayloadAction<{ pageIndex: number; pageSize: number }>) {
      state.pagination = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  toggleDataChanged,
  setPagination
} = GroupListUiSlice.actions;

export default GroupListUiSlice.reducer;
