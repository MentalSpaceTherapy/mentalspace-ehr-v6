import { Client } from './Client';

export interface InsurancePolicy {
  id: string;
  clientId: string;
  client: Client;
  insuranceCarrier: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  subscriberDateOfBirth?: Date;
  effectiveDate: Date;
  expirationDate?: Date;
  coverageType: 'primary' | 'secondary' | 'tertiary';
  copayAmount?: number;
  coinsurancePercentage?: number;
  deductibleAmount?: number;
  deductibleMet?: boolean;
  authorizationRequired: boolean;
  authorizationNumber?: string;
  authorizationStartDate?: Date;
  authorizationEndDate?: Date;
  authorizedSessions?: number;
  authorizedSessionsUsed?: number;
  verificationDate?: Date;
  verificationNotes?: string;
  status: 'active' | 'inactive' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
}
