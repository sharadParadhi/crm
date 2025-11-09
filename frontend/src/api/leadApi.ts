import { apiClient } from './client';

export interface Lead {
  id: number;
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON';
  ownerId?: number;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  activities?: Activity[];
  history?: LeadHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  leadId: number;
  type: 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL' | 'STATUS_CHANGE';
  note?: string;
  meta?: Record<string, any>;
  createdBy: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface LeadHistory {
  id: number;
  leadId: number;
  from?: string;
  to?: string;
  reason?: string;
  changedBy: number;
  changer: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface CreateLeadRequest {
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: Lead['status'];
  ownerId?: number;
}

export interface UpdateLeadRequest {
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: Lead['status'];
  ownerId?: number;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const leadApi = {
  getLeads: async (params?: {
    status?: string;
    ownerId?: number;
    page?: number;
    limit?: number;
  }): Promise<LeadsResponse> => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },

  getLead: async (id: number): Promise<{ success: boolean; data: Lead }> => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: CreateLeadRequest): Promise<{ success: boolean; data: Lead }> => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  updateLead: async (id: number, data: UpdateLeadRequest): Promise<{ success: boolean; data: Lead }> => {
    const response = await apiClient.put(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },
};
