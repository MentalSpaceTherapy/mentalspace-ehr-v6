import { Staff } from './Staff';

export interface DocumentationDeadline {
  id: string;
  staffId: string;
  staff: Staff;
  documentType: 'progress_note' | 'assessment' | 'treatment_plan' | 'discharge_summary' | 'other';
  dueDate: Date;
  reminderDate?: Date;
  status: 'pending' | 'completed' | 'overdue' | 'waived';
  completedAt?: Date;
  waivedById?: string;
  waivedBy?: Staff;
  waivedReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
  updatedAt: Date;
}
