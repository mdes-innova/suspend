import { configureStore } from '@reduxjs/toolkit';
import passwordResetUiReducer from './features/password-reset-ui-slice';
import userMenuUiReducer from './features/user-menu-ui-slice';
import userAuthReducer from './features/user-auth-slice';
import playlistDialogReducer from './features/playlist-diaolog-ui-slice';
import contentListUiReducer from './features/content-list-ui-slice';
import dialogListUiReducer from './features/dialog-list-ui-slice';
import mailboxListUiReducer from './features/mailbox-list-ui-slice';
import documentListUiReducer from './features/document-list-ui-slice';
import loadingUiReducer from './features/loading-ui-slice';
import groupListUiReducer from './features/group-list-ui-slice';
import groupUiReducer from './features/group-ui-slice';

export const store = configureStore({
  reducer: {
    passwordResetUi: passwordResetUiReducer,
    userMenuUi: userMenuUiReducer,
    userAuth: userAuthReducer,
    playlistDialogUi: playlistDialogReducer,
    contentListUi: contentListUiReducer,
    dialogListUi: dialogListUiReducer,
    mailboxListUi: mailboxListUiReducer,
    documentListUi: documentListUiReducer,
    loadingUi: loadingUiReducer,
    groupListUi: groupListUiReducer,
    groupUi: groupUiReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
