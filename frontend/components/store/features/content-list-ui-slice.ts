import { type Document } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';

// Define the shape of the table state
export interface ContentListUiState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  tableData: Document[];
  toggleDataState: boolean;
  toggleDocumentIdsSelection: boolean;
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
  tableData: [],
  toggleDocumentIdsSelection: false,
  toggleDataState: false
};

// Create the slice
const contenListUiSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSorting(state: ContentListUiState, action: PayloadAction<SortingState>) {
      state.sorting = action.payload;
    },
    setColumnFilters(state: ContentListUiState, action: PayloadAction<ColumnFiltersState>) {
      state.columnFilters = action.payload;
    },
    setColumnVisibility(state: ContentListUiState, action: PayloadAction<VisibilityState>) {
      state.columnVisibility = action.payload;
    },
    setRowSelection(state: ContentListUiState, action: PayloadAction<RowSelectionState>) {
      state.rowSelection = action.payload;
    },
    setPagination(state: ContentListUiState, action: PayloadAction<{ pageIndex: number; pageSize: number }>) {
      state.pagination = action.payload;
    },
    setToggleDocumentIdsSelection(state: ContentListUiState) {
      state.toggleDocumentIdsSelection = !state.toggleDocumentIdsSelection;
    },
    toggleData(state: ContentListUiState) {
      state.toggleDataState = !state.toggleDataState
    }
  },
});

// Export actions and reducer
export const {
  setSorting,
  setColumnFilters,
  setColumnVisibility,
  setRowSelection,
  setPagination,
  toggleData
} = contenListUiSlice.actions;

export default contenListUiSlice.reducer;
