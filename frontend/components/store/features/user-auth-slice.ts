import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type User } from '@/lib/types';

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
