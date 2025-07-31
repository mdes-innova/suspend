import { type GroupFile, type Document } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    name: string;
    documents: Document[];
    groupFiles: GroupFile[];
}

const initialState: UiState = {
    name: '',
    documents: [],
    groupFiles: [],
}

const groupUiSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setName(state: UiState, action: PayloadAction<string>) {
            state.name = action.payload;
        },
        setDocuments(state: UiState, action: PayloadAction<Document[]>) {
            state.documents = action.payload;
        },
        setGroupFiles(state: UiState, action: PayloadAction<GroupFile[]>) {
            state.groupFiles = action.payload;
        },
    }
});

export const { setName, setDocuments, setGroupFiles, setToggleCollectData } = groupUiSlice.actions;
export default groupUiSlice.reducer;