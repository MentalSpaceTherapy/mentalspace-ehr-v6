import { Staff } from './Staff';

export interface SupervisionRelationship {
  id: string;
  supervisorId: string;
  supervisor: Staff;
  superviseeId: string;
  supervisee: Staff;
  relationshipType: 'clinical' | 'administrative' | 'both';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'pending';
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
