import { Staff } from './Staff';

export interface CompensationRule {
  id: string;
  staffId: string;
  staff: Staff;
  ruleType: 'hourly' | 'salary' | 'per_session' | 'percentage';
  amount: number;
  currency: string;
  effectiveDate: Date;
  endDate?: Date;
  description?: string;
  payPeriod?: 'weekly' | 'biweekly' | 'monthly';
  maxHoursPerWeek?: number;
  overtimeMultiplier?: number;
  sessionTypes?: string[];
  percentageBase?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
