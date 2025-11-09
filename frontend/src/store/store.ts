import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import leadSlice from './slices/leadSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    leads: leadSlice,
    notifications: notificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
