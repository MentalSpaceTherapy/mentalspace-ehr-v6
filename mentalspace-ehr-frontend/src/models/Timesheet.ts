import { Staff } from './Staff';
import { Client } from './Client';

export interface Timesheet {
  id: string;
  staffId: string;
  staff: Staff;
  clientId?: string;
  client?: Client;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  activityType: 'session' | 'documentation' | 'supervision' | 'meeting' | 'training' | 'administrative' | 'other';
  description?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approvedById?: string;
  approvedBy?: Staff;
  approvedAt?: Date;
  rejectionReason?: string;
  billable: boolean;
  payrollId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
