import { apiClient } from './client';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (read?: boolean): Promise<{ success: boolean; data: Notification[] }> => {
    const response = await apiClient.get('/notifications', { params: { read } });
    return response.data;
  },

  markAsRead: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },
};
