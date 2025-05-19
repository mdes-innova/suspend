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
}

// Initial state with type annotation
const initialState: ContentListUiState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
};

// Create the slice
const contenListUiSlice = createSlice({
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
  },
});

// Export actions and reducer
export const {
  setSorting,
  setColumnFilters,
  setColumnVisibility,
  setRowSelection,
} = contenListUiSlice.actions;

export default contenListUiSlice.reducer;
