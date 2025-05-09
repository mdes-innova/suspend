import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  username: string;
  isStaff: boolean;
  isActive: boolean;
};

interface UIState {
  user: User | null;
}

const initialState: UIState = {
  user: null,
};

const userAuthSlice = createSlice({
  name: 'user-auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userAuthSlice.actions;
export default userAuthSlice.reducer;
