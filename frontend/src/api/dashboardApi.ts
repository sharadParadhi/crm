import { apiClient } from './client';

export interface DashboardStats {
  stats: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    qualifiedLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalActivities: number;
  };
  charts: {
    leadsByStatus: Array<{ status: string; count: number }>;
    activitiesByType: Array<{ type: string; count: number }>;
  };
  recentLeads: any[];
  recentActivities: any[];
}

export const dashboardApi = {
  getStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};
