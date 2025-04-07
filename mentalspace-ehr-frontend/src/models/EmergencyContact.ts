import React from 'react';

export interface EmergencyContact {
  id?: string;
  clientId?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default EmergencyContact;
