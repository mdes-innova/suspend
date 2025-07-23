import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

// Define the shape of the table state
interface ContentListUiState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

// Initial state with type annotation
const initialState: ContentListUiState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  pagination: {
    pageIndex: 0,
    pageSize: 20,
  },
};

// Create the slice
const mailboxUiSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSorting(state, action: PayloadAction<SortingState>) {
      state.sorting = action.payload;
    },
    setColumnFilters(state, action: PayloadAction<ColumnFiltersState>) {
      state.columnFilters = action.payload;
    },
    setColumnVisibility(state, action: PayloadAction<VisibilityState>) {
      state.columnVisibility = action.payload;
    },
    setRowSelection(state, action: PayloadAction<RowSelectionState>) {
      state.rowSelection = action.payload;
    },
    setPagination(state, action: PayloadAction<{ pageIndex: number; pageSize: number }>) {
      state.pagination = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  setSorting,
  setColumnFilters,
  setColumnVisibility,
  setRowSelection,
  setPagination,
} = mailboxUiSlice.actions;

export default mailboxUiSlice.reducer;
