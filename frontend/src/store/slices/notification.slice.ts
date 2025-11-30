import { Notification } from "@/src/types/notification.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id">>
    ) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now() + Math.random(),
        autoClose: action.payload.autoClose ?? true,
        duration: action.payload.duration ?? 5000,
        startTime: Date.now(),
      };
      state.notifications = [...state.notifications, newNotification];
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
