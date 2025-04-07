import { Role } from './Role';

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  role: 'clinician' | 'admin' | 'scheduler' | 'biller' | 'supervisor';
  status: StaffStatus;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  supervisorId?: string;
  supervisor?: Staff;
  supervisees?: Staff[];
}
