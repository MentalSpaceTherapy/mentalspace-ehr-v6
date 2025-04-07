import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClientProvider } from '../../contexts/ClientContext';
import { AuthProvider } from '../../contexts/AuthContext';
import secureClientService from '../../services/secureClientService';
import { encryptData, decryptData } from '../../services/encryptionService';

// Mock the encryption service
jest.mock('../../services/encryptionService', () => ({
  encryptData: jest.fn(data => `encrypted_${data}`),
  decryptData: jest.fn(data => data.replace('encrypted_', ''))
}));

// Mock the secure API call
jest.mock('../../services/secureApi', () => ({
  secureApiCall: jest.fn().mockImplementation((method, url, data) => {
    if (method === 'GET' && url === '/clients/123') {
      return Promise.resolve({
        data: {
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: 'encrypted_1990-01-01',
          gender: 'Male',
          phone: 'encrypted_555-123-4567',
          email: 'encrypted_john.doe@example.com',
          address: {
            street: 'encrypted_123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345'
          }
        }
      });
    }
    return Promise.resolve({ data: { id: '123', ...data } });
  })
}));

// Mock the audit log service
jest.mock('../../services/auditService', () => ({
  auditLog: jest.fn()
}));

describe('Secure Client Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('encrypts sensitive data when creating a client', async () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      phone: '555-123-4567',
      email: 'john.doe@example.com',
      address: {
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA'
      },
      emergencyContactName: 'Jane Doe',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '555-987-6543',
      primaryCareProvider: 'Dr. Smith',
      courtMandated: false
    };

    await secureClientService.createClient(formData);

    // Verify that sensitive data was encrypted
    expect(encryptData).toHaveBeenCalledWith('1990-01-01');
    expect(encryptData).toHaveBeenCalledWith('555-123-4567');
    expect(encryptData).toHaveBeenCalledWith('john.doe@example.com');
    expect(encryptData).toHaveBeenCalledWith('123 Main St');
    expect(encryptData).toHaveBeenCalledWith('Jane Doe');
    expect(encryptData).toHaveBeenCalledWith('555-987-6543');
    expect(encryptData).toHaveBeenCalledWith('Dr. Smith');
  });

  test('decrypts sensitive data when retrieving a client', async () => {
    const client = await secureClientService.getClient('123');

    // Verify that sensitive data was decrypted
    expect(decryptData).toHaveBeenCalledWith('encrypted_1990-01-01');
    expect(decryptData).toHaveBeenCalledWith('encrypted_555-123-4567');
    expect(decryptData).toHaveBeenCalledWith('encrypted_john.doe@example.com');
    expect(decryptData).toHaveBeenCalledWith('encrypted_123 Main St');

    // Verify the decrypted data
    expect(client.dateOfBirth).toEqual(new Date('1990-01-01'));
    expect(client.phone).toEqual('555-123-4567');
    expect(client.email).toEqual('john.doe@example.com');
    expect(client.address.street).toEqual('123 Main St');
  });

  test('handles file uploads securely', async () => {
    // Create a mock file
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock the secure API call for file upload
    const mockSecureApiCall = require('../../services/secureApi').secureApiCall;
    mockSecureApiCall.mockImplementationOnce(() => 
      Promise.resolve({ 
        data: { 
          id: 'file123', 
          entityType: 'insurance_policy', 
          entityId: '123', 
          fileType: 'insurance_card_front',
          originalFilename: 'test.jpg',
          filePath: '/uploads/test.jpg',
          fileSize: 12,
          mimeType: 'image/jpeg'
        } 
      })
    );

    const result = await secureClientService.secureFileUpload(
      'insurance_policy', 
      '123', 
      'insurance_card_front', 
      file
    );

    // Verify the result
    expect(result.id).toEqual('file123');
    expect(result.entityType).toEqual('insurance_policy');
    expect(result.entityId).toEqual('123');
    expect(result.fileType).toEqual('insurance_card_front');
    
    // Verify that the audit log was called
    const auditLog = require('../../services/auditService').auditLog;
    expect(auditLog).toHaveBeenCalledWith('file_upload_attempt', expect.any(Object));
    expect(auditLog).toHaveBeenCalledWith('file_upload_success', expect.any(Object));
  });

  test('logs audit events for all operations', async () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      phone: '555-123-4567',
      emergencyContactName: 'Jane Doe',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '555-987-6543'
    };

    // Test create client
    await secureClientService.createClient(formData);
    
    // Test get client
    await secureClientService.getClient('123');
    
    // Verify audit logs
    const auditLog = require('../../services/auditService').auditLog;
    expect(auditLog).toHaveBeenCalledWith('client_create_attempt', expect.any(Object));
    expect(auditLog).toHaveBeenCalledWith('client_create_success', expect.any(Object));
    expect(auditLog).toHaveBeenCalledWith('client_access', expect.any(Object));
  });
});
