import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi, Notification } from '../../api/notificationApi';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (read?: boolean) => {
    const response = await notificationApi.getNotifications(read);
    return response.data;
  }
);

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id: number) => {
  await notificationApi.markAsRead(id);
  return id;
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
  await notificationApi.markAllAsRead();
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.read).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
