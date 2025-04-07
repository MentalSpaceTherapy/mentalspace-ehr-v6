import React from 'react';
import { Client } from '../models/Client';
import { EmergencyContact } from '../models/EmergencyContact';
import { FileUpload } from '../models/FileUpload';

export interface EmergencyContactModel {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export interface FileUploadModel {
  id?: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  filePath?: string;
}

export interface ClientFormData {
  // Basic Demographics
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  genderOther?: string;
  
  // Contact Information
  phone: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    countryOther?: string;
  };
  
  // Insurance Information
  insuranceCarrier?: string;
  insuranceCarrierOther?: string;
  policyNumber?: string;
  groupNumber?: string;
  coverageStartDate?: string;
  coverageEndDate?: string;
  insuranceCardFront?: File;
  insuranceCardBack?: File;
  
  // Emergency Contact & Additional Details
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  primaryCareProvider?: string;
  referredBy?: string;
  caseNumber?: string;
  courtMandated: boolean;
  courtMandatedNotes?: string;
}

export const mapClientFormDataToApiModel = (formData: ClientFormData): {
  client: Partial<Client>,
  emergencyContact: Partial<EmergencyContact>,
  insuranceCardFront?: File,
  insuranceCardBack?: File
} => {
  return {
    client: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      preferredName: formData.preferredName,
      dateOfBirth: new Date(formData.dateOfBirth),
      gender: formData.gender === 'Other' ? formData.genderOther : formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: {
        street: formData.address.line1,
        line2: formData.address.line2,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.postalCode,
        country: formData.address.country === 'Other' ? formData.address.countryOther : formData.address.country,
      },
      primaryCareProvider: formData.primaryCareProvider,
      referralSource: formData.referredBy,
      caseNumber: formData.caseNumber,
      courtMandated: formData.courtMandated,
      courtMandatedNotes: formData.courtMandated ? formData.courtMandatedNotes : undefined,
      status: 'active',
    },
    emergencyContact: {
      name: formData.emergencyContactName,
      relationship: formData.emergencyContactRelationship,
      phone: formData.emergencyContactPhone,
      isPrimary: true
    },
    insuranceCardFront: formData.insuranceCardFront,
    insuranceCardBack: formData.insuranceCardBack
  };
};

export const mapApiModelToClientFormData = (
  client: Client, 
  emergencyContact?: EmergencyContact,
  insuranceCardFront?: FileUpload,
  insuranceCardBack?: FileUpload
): ClientFormData => {
  return {
    // Basic Demographics
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    preferredName: client.preferredName || '',
    dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
    gender: client.gender || '',
    
    // Contact Information
    phone: client.phone || '',
    email: client.email || '',
    address: {
      line1: client.address?.street || '',
      line2: client.address?.line2 || '',
      city: client.address?.city || '',
      state: client.address?.state || '',
      postalCode: client.address?.zipCode || '',
      country: client.address?.country || 'USA',
    },
    
    // Emergency Contact
    emergencyContactName: emergencyContact?.name || '',
    emergencyContactRelationship: emergencyContact?.relationship || '',
    emergencyContactPhone: emergencyContact?.phone || '',
    
    // Additional Details
    primaryCareProvider: client.primaryCareProvider || '',
    referredBy: client.referralSource || '',
    caseNumber: client.caseNumber || '',
    courtMandated: client.courtMandated || false,
    courtMandatedNotes: client.courtMandatedNotes || '',
  };
};
