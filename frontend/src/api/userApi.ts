import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_EXEC';
  createdAt: string;
  _count?: {
    leads: number;
    activities: number;
  };
  leads?: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'SALES_EXEC';
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: 'ADMIN' | 'MANAGER' | 'SALES_EXEC';
}

export const userApi = {
  getUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getUser: async (id: number): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
