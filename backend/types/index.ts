import { Request } from 'express';
import { Role, LeadStatus, ActivityType } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

export interface CreateLeadDto {
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  ownerId?: number;
}

export interface UpdateLeadDto {
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  ownerId?: number;
}

export interface CreateActivityDto {
  leadId: number;
  type: ActivityType;
  note?: string;
  meta?: Record<string, any>;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}
