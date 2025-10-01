import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContentListUiState {
  ispTablePagination: {
    pageIndex: number;
    pageSize: number;
  };
  userTablePagination: {
    pageIndex: number;
    pageSize: number;
  };
}

// Initial state with type annotation
const initialState: ContentListUiState = {
  ispTablePagination: {
    pageIndex: 0,
    pageSize: 40
  },
  userTablePagination: {
    pageIndex: 0,
    pageSize: 40
  }
};

// Create the slice
const utilsUiSlice = createSlice({
  name: 'utils-ui',
  initialState,
  reducers: {
    setIspPagination(state: ContentListUiState, action: PayloadAction<{ pageIndex: number; pageSize: number }>) {
      state.ispTablePagination = action.payload;
    },
    setUserPagination(state: ContentListUiState, action: PayloadAction<{ pageIndex: number; pageSize: number }>) {
      state.userTablePagination = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  setIspPagination,
  setUserPagination
} = utilsUiSlice.actions;

export default utilsUiSlice.reducer;
