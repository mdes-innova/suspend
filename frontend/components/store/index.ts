import { configureStore } from '@reduxjs/toolkit';
import passwordResetUiReducer from './features/password-reset-ui-slice';

export const store = configureStore({
  reducer: {
    ui: passwordResetUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
