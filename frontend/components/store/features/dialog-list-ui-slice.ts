import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

// Define the shape of the table state
interface DialogListUiState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  docIds: null | number[];
}

// Initial state with type annotation
const initialState: DialogListUiState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  docIds: null,
  pagination: {
    pageIndex: 0,
    pageSize: 20,
  },
};

// Create the slice
const dialogListUiSlice = createSlice({
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
    setDocIds(state, action: PayloadAction<number[] | null>) {
      state.docIds = action.payload? action.payload: null;
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
  setDocIds
} = dialogListUiSlice.actions;

export default dialogListUiSlice.reducer;
