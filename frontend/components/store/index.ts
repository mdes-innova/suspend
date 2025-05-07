import { configureStore } from '@reduxjs/toolkit';
import passwordResetUiReducer from './features/password-reset-ui-slice';
import userMenuUiReducer from './features/user-menu-ui-slice';

export const store = configureStore({
  reducer: {
    passwordResetUi: passwordResetUiReducer,
    userMenuUi: userMenuUiReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
