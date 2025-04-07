import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocumentationProvider } from '../../contexts/DocumentationContext';
import { AuthProvider } from '../../contexts/AuthContext';
import documentationService from '../../services/documentation/documentationService';
import { encryptionService } from '../../services/encryptionService';

// Mock the services
jest.mock('../../services/documentation/documentationService');
jest.mock('../../services/encryptionService');

describe('Documentation Security Features', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock encryption service methods
    encryptionService.encrypt = jest.fn().mockReturnValue('encrypted-data');
    encryptionService.decrypt = jest.fn().mockReturnValue('decrypted-data');
    encryptionService.encryptObject = jest.fn().mockReturnValue('encrypted-object');
    encryptionService.decryptToObject = jest.fn().mockReturnValue({ test: 'data' });
    encryptionService.hash = jest.fn().mockReturnValue('hashed-signature');
    encryptionService.secureStore = jest.fn();
    encryptionService.secureRetrieve = jest.fn().mockReturnValue({ structuredContent: { test: 'data' } });
    
    // Mock documentation service methods
    documentationService.createNote = jest.fn().mockResolvedValue({ id: '123' });
    documentationService.saveDraft = jest.fn().mockResolvedValue({ id: '123' });
    documentationService.recoverDraft = jest.fn().mockReturnValue({ test: 'recovered data' });
    documentationService.finalizeNote = jest.fn().mockResolvedValue({ id: '123', status: 'SIGNED' });
    documentationService.checkSessionActivity = jest.fn().mockReturnValue(true);
    documentationService.recordUserActivity = jest.fn();
  });

  test('encrypts sensitive data when creating a note', async () => {
    // Create test data
    const noteData = {
      clientId: '101',
      providerId: '201',
      noteType: 'INTAKE',
      structuredContent: {
        clientIdentification: {
          clientName: 'John Doe',
          dateOfBirth: '1990-01-01'
        }
      },
      status: 'DRAFT'
    };
    
    // Call the service method
    await documentationService.createNote(noteData);
    
    // Check if encryption was used
    expect(encryptionService.encryptObject).toHaveBeenCalledWith(noteData.structuredContent);
  });

  test('securely stores drafts locally', async () => {
    // Create test data
    const noteId = '123';
    const draftData = {
      clientIdentification: {
        clientName: 'John Doe',
        dateOfBirth: '1990-01-01'
      }
    };
    
    // Call the service method
    await documentationService.saveDraft(noteId, draftData);
    
    // Check if secure storage was used
    expect(encryptionService.secureStore).toHaveBeenCalled();
    expect(encryptionService.encryptObject).toHaveBeenCalled();
  });

  test('recovers drafts from secure storage', () => {
    // Call the service method
    const result = documentationService.recoverDraft('123');
    
    // Check if secure retrieval was used
    expect(encryptionService.secureRetrieve).toHaveBeenCalled();
    expect(result).toEqual({ test: 'recovered data' });
  });

  test('hashes signatures for note finalization', async () => {
    // Call the service method
    await documentationService.finalizeNote('123', 'Dr. John Smith');
    
    // Check if signature hashing was used
    expect(encryptionService.hash).toHaveBeenCalledWith('Dr. John Smith');
  });

  test('checks session activity for security timeout', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(new Date().toISOString()),
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Call the service method
    const result = documentationService.checkSessionActivity();
    
    // Check if localStorage was accessed
    expect(localStorageMock.getItem).toHaveBeenCalledWith('lastActivityTimestamp');
    expect(result).toBe(true);
  });

  test('records user activity to prevent session timeout', () => {
    // Mock localStorage
    const localStorageMock = {
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Call the service method
    documentationService.recordUserActivity();
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('lastActivityTimestamp', expect.any(String));
  });
});
