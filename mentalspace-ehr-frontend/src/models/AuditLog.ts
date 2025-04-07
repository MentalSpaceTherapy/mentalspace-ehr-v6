import { Staff } from '../models/Staff';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  user?: Staff;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  entityId?: string;
  entityType?: string;
  oldValue?: string;
  newValue?: string;
  module: 'auth' | 'staff' | 'client' | 'scheduling' | 'documentation' | 'billing' | 'messaging' | 'crm' | 'settings';
  severity: 'info' | 'warning' | 'critical';
}
