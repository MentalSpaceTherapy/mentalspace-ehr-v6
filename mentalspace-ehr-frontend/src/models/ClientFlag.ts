import { Client } from './Client';

export interface ClientFlag {
  id: string;
  clientId: string;
  client: Client;
  flagType: 'alert' | 'warning' | 'info' | 'custom';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
