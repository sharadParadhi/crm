import { apiClient } from './client';
import { Activity } from './leadApi';

export interface CreateActivityRequest {
  leadId: number;
  type: 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL' | 'STATUS_CHANGE';
  note?: string;
  meta?: Record<string, any>;
}

export const activityApi = {
  getActivities: async (leadId?: number): Promise<{ success: boolean; data: Activity[] }> => {
    const response = await apiClient.get('/activities', { params: { leadId } });
    return response.data;
  },

  getActivity: async (id: number): Promise<{ success: boolean; data: Activity }> => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityRequest): Promise<{ success: boolean; data: Activity }> => {
    const response = await apiClient.post('/activities', data);
    return response.data;
  },
};
