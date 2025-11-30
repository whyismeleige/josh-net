import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import authReducer, { AuthState } from "./slices/auth.slice";
import notificationReducer, {
  NotificationState,
} from "./slices/notification.slice";

export interface RootState {
  auth: AuthState;
  notification: NotificationState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
