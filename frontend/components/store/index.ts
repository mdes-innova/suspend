import { configureStore } from '@reduxjs/toolkit';
import passwordResetUiReducer from './features/password-reset-ui-slice';
import userMenuUiReducer from './features/user-menu-ui-slice';
import userAuthReducer from './features/user-auth-slice';
import playlistDialogReducer from './features/playlist-diaolog-ui-slice';
import contentListUiReducer from './features/content-list-ui-slice';

export const store = configureStore({
  reducer: {
    passwordResetUi: passwordResetUiReducer,
    userMenuUi: userMenuUiReducer,
    userAuth: userAuthReducer,
    playlistDialogUi: playlistDialogReducer,
    contentListUi: contentListUiReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
