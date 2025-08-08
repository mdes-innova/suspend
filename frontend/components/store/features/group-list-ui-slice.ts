import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// Define the shape of the table state
interface GroupListtUiState {
  dataChanged: boolean;
  rename: number;
}

// Initial state with type annotation
const initialState: GroupListtUiState = {
  dataChanged: false,
  rename: -1
};

// Create the slice
const GroupListUiSlice = createSlice({
  name: 'grouplist',
  initialState,
  reducers: {
    toggleDataChanged(state: GroupListtUiState) {
      state.dataChanged = !state.dataChanged;
    },
    setRename(state: GroupListtUiState, action: PayloadAction<number>) {
      state.rename = action.payload;
    }
  },
});

// Export actions and reducer
export const {
  toggleDataChanged,
  setRename
} = GroupListUiSlice.actions;

export default GroupListUiSlice.reducer;
