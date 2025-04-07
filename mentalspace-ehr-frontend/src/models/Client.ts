import { Staff } from './Staff';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  gender?: string;
  pronouns?: string;
  status: 'active' | 'inactive' | 'waitlist' | 'discharged' | 'inquiry';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryProviderId?: string;
  primaryProvider?: Staff;
  referralSource?: string;
  referralDate?: Date;
  intakeDate?: Date;
  dischargeDate?: Date;
  dischargeReason?: string;
  notes?: string;
  flags?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
