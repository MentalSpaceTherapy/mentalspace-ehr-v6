import { Staff } from './Staff';

export interface DashboardAlert {
  id: string;
  staffId: string;
  staff?: Staff;
  type: 'documentation' | 'billing' | 'appointment' | 'message' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
