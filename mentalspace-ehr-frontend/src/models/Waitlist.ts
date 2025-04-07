import { Client } from './Client';

export interface Waitlist {
  id: string;
  clientId: string;
  client: Client;
  requestDate: Date;
  status: 'pending' | 'contacted' | 'scheduled' | 'removed';
  priority: 'high' | 'medium' | 'low';
  serviceRequested: string;
  preferredDays?: string[];
  preferredTimes?: string[];
  preferredProviders?: string[];
  notes?: string;
  contactAttempts?: {
    date: Date;
    method: 'phone' | 'email' | 'text' | 'other';
    successful: boolean;
    notes: string;
  }[];
  lastContactAttempt?: Date;
  estimatedWaitTime?: string;
  createdAt: Date;
  updatedAt: Date;
}
