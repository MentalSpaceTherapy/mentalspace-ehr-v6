import { encryptData, decryptData } from '../services/encryptionService';
import { secureApiCall } from '../services/secureApi';
import { ClientFormData, mapClientFormDataToApiModel } from '../models/ClientFormData';
import { Client } from '../models/Client';
import { EmergencyContact } from '../models/EmergencyContact';
import { FileUpload } from '../models/FileUpload';
import { auditLog } from '../services/auditService';

// Enhanced security service for client management
export const secureClientService = {
  // Create client with encryption for sensitive data
  createClient: async (formData: ClientFormData): Promise<Client> => {
    try {
      // Log the action (without sensitive data)
      auditLog('client_create_attempt', { 
        action: 'create_client',
        metadata: { 
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      
      // Map form data to API models
      const { client: clientData, emergencyContact: contactData, insuranceCardFront, insuranceCardBack } = 
        mapClientFormDataToApiModel(formData);
      
      // Encrypt sensitive fields
      const encryptedClientData = {
        ...clientData,
        // Encrypt PII (Personally Identifiable Information)
        dateOfBirth: encryptData(clientData.dateOfBirth?.toString() || ''),
        phone: encryptData(clientData.phone || ''),
        email: clientData.email ? encryptData(clientData.email) : null,
        address: clientData.address ? {
          ...clientData.address,
          street: encryptData(clientData.address.street || ''),
          line2: clientData.address.line2 ? encryptData(clientData.address.line2) : null,
        } : null,
        // Encrypt PHI (Protected Health Information)
        primaryCareProvider: clientData.primaryCareProvider ? encryptData(clientData.primaryCareProvider) : null,
        courtMandatedNotes: clientData.courtMandatedNotes ? encryptData(clientData.courtMandatedNotes) : null,
      };
      
      // Encrypt emergency contact data
      const encryptedContactData = contactData ? {
        ...contactData,
        name: encryptData(contactData.name || ''),
        phone: encryptData(contactData.phone || ''),
        email: contactData.email ? encryptData(contactData.email) : null,
      } : null;
      
      // Make secure API call with encrypted data
      const response = await secureApiCall('POST', '/clients', encryptedClientData);
      const newClient = response.data;
      
      // Create emergency contact with encrypted data
      if (encryptedContactData) {
        await secureApiCall('POST', `/clients/${newClient.id}/emergencycontacts`, encryptedContactData);
      }
      
      // Create insurance policy if carrier is provided
      if (formData.insuranceCarrier) {
        const policyData = {
          carrier_name: formData.insuranceCarrier === 'Other' ? formData.insuranceCarrierOther : formData.insuranceCarrier,
          policy_number: encryptData(formData.policyNumber || ''),
          group_number: formData.groupNumber ? encryptData(formData.groupNumber) : null,
          coverage_start_date: formData.coverageStartDate,
          coverage_end_date: formData.coverageEndDate
        };
        
        const policyResponse = await secureApiCall('POST', `/clients/${newClient.id}/insurancepolicies`, policyData);
        const newPolicy = policyResponse.data;
        
        // Upload insurance card images if provided with secure handling
        if (insuranceCardFront) {
          await secureFileUpload('insurance_policy', newPolicy.id, 'insurance_card_front', insuranceCardFront);
        }
        
        if (insuranceCardBack) {
          await secureFileUpload('insurance_policy', newPolicy.id, 'insurance_card_back', insuranceCardBack);
        }
      }
      
      // Log successful creation
      auditLog('client_create_success', { 
        action: 'create_client',
        metadata: { 
          clientId: newClient.id,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      
      return newClient;
    } catch (error) {
      // Log failure
      auditLog('client_create_failure', { 
        action: 'create_client',
        error: error.message,
        metadata: { 
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      throw error;
    }
  },
  
  // Update client with encryption for sensitive data
  updateClient: async (id: string, formData: ClientFormData): Promise<Client> => {
    try {
      // Log the action (without sensitive data)
      auditLog('client_update_attempt', { 
        action: 'update_client',
        metadata: { 
          clientId: id,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      
      // Map form data to API models
      const { client: clientData, emergencyContact: contactData, insuranceCardFront, insuranceCardBack } = 
        mapClientFormDataToApiModel(formData);
      
      // Encrypt sensitive fields
      const encryptedClientData = {
        ...clientData,
        // Encrypt PII (Personally Identifiable Information)
        dateOfBirth: encryptData(clientData.dateOfBirth?.toString() || ''),
        phone: encryptData(clientData.phone || ''),
        email: clientData.email ? encryptData(clientData.email) : null,
        address: clientData.address ? {
          ...clientData.address,
          street: encryptData(clientData.address.street || ''),
          line2: clientData.address.line2 ? encryptData(clientData.address.line2) : null,
        } : null,
        // Encrypt PHI (Protected Health Information)
        primaryCareProvider: clientData.primaryCareProvider ? encryptData(clientData.primaryCareProvider) : null,
        courtMandatedNotes: clientData.courtMandatedNotes ? encryptData(clientData.courtMandatedNotes) : null,
      };
      
      // Make secure API call with encrypted data
      const response = await secureApiCall('PUT', `/clients/${id}`, encryptedClientData);
      const updatedClient = response.data;
      
      // Get existing emergency contacts
      const contactsResponse = await secureApiCall('GET', `/clients/${id}/emergencycontacts`);
      const existingContacts = contactsResponse.data;
      
      // Encrypt emergency contact data
      const encryptedContactData = contactData ? {
        ...contactData,
        name: encryptData(contactData.name || ''),
        phone: encryptData(contactData.phone || ''),
        email: contactData.email ? encryptData(contactData.email) : null,
      } : null;
      
      // Update or create emergency contact
      if (encryptedContactData) {
        if (existingContacts.length > 0) {
          // Update existing primary emergency contact
          const primaryContact = existingContacts.find(c => c.isPrimary);
          if (primaryContact) {
            await secureApiCall('PUT', `/emergencycontacts/${primaryContact.id}`, encryptedContactData);
          } else {
            await secureApiCall('POST', `/clients/${id}/emergencycontacts`, encryptedContactData);
          }
        } else {
          // Create new emergency contact
          await secureApiCall('POST', `/clients/${id}/emergencycontacts`, encryptedContactData);
        }
      }
      
      // Get existing insurance policies
      const policiesResponse = await secureApiCall('GET', `/clients/${id}/insurancepolicies`);
      const existingPolicies = policiesResponse.data;
      
      // Update or create insurance policy
      if (formData.insuranceCarrier) {
        const policyData = {
          carrier_name: formData.insuranceCarrier === 'Other' ? formData.insuranceCarrierOther : formData.insuranceCarrier,
          policy_number: encryptData(formData.policyNumber || ''),
          group_number: formData.groupNumber ? encryptData(formData.groupNumber) : null,
          coverage_start_date: formData.coverageStartDate,
          coverage_end_date: formData.coverageEndDate
        };
        
        if (existingPolicies.length > 0) {
          // Update existing policy
          const policy = existingPolicies[0]; // Assume first policy is the one to update
          await secureApiCall('PUT', `/insurancepolicies/${policy.id}`, policyData);
          
          // Upload new insurance card images if provided
          if (insuranceCardFront) {
            await secureFileUpload('insurance_policy', policy.id, 'insurance_card_front', insuranceCardFront);
          }
          
          if (insuranceCardBack) {
            await secureFileUpload('insurance_policy', policy.id, 'insurance_card_back', insuranceCardBack);
          }
        } else {
          // Create new policy
          const policyResponse = await secureApiCall('POST', `/clients/${id}/insurancepolicies`, policyData);
          const newPolicy = policyResponse.data;
          
          // Upload insurance card images if provided
          if (insuranceCardFront) {
            await secureFileUpload('insurance_policy', newPolicy.id, 'insurance_card_front', insuranceCardFront);
          }
          
          if (insuranceCardBack) {
            await secureFileUpload('insurance_policy', newPolicy.id, 'insurance_card_back', insuranceCardBack);
          }
        }
      }
      
      // Log successful update
      auditLog('client_update_success', { 
        action: 'update_client',
        metadata: { 
          clientId: id,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      
      return updatedClient;
    } catch (error) {
      // Log failure
      auditLog('client_update_failure', { 
        action: 'update_client',
        error: error.message,
        metadata: { 
          clientId: id,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });
      throw error;
    }
  },
  
  // Get client with decryption for sensitive data
  getClient: async (id: string): Promise<Client> => {
    try {
      // Log the action
      auditLog('client_access', { 
        action: 'get_client',
        metadata: { clientId: id }
      });
      
      // Make secure API call
      const response = await secureApiCall('GET', `/clients/${id}`);
      const encryptedClient = response.data;
      
      // Decrypt sensitive fields
      const decryptedClient = {
        ...encryptedClient,
        // Decrypt PII (Personally Identifiable Information)
        dateOfBirth: encryptedClient.dateOfBirth ? new Date(decryptData(encryptedClient.dateOfBirth)) : null,
        phone: encryptedClient.phone ? decryptData(encryptedClient.phone) : '',
        email: encryptedClient.email ? decryptData(encryptedClient.email) : null,
        address: encryptedClient.address ? {
          ...encryptedClient.address,
          street: decryptData(encryptedClient.address.street || ''),
          line2: encryptedClient.address.line2 ? decryptData(encryptedClient.address.line2) : null,
        } : null,
        // Decrypt PHI (Protected Health Information)
        primaryCareProvider: encryptedClient.primaryCareProvider ? decryptData(encryptedClient.primaryCareProvider) : null,
        courtMandatedNotes: encryptedClient.courtMandatedNotes ? decryptData(encryptedClient.courtMandatedNotes) : null,
      };
      
      return decryptedClient;
    } catch (error) {
      // Log failure
      auditLog('client_access_failure', { 
        action: 'get_client',
        error: error.message,
        metadata: { clientId: id }
      });
      throw error;
    }
  },
  
  // Get emergency contacts with decryption
  getEmergencyContacts: async (clientId: string): Promise<EmergencyContact[]> => {
    try {
      // Log the action
      auditLog('emergency_contact_access', { 
        action: 'get_emergency_contacts',
        metadata: { clientId }
      });
      
      // Make secure API call
      const response = await secureApiCall('GET', `/clients/${clientId}/emergencycontacts`);
      const encryptedContacts = response.data;
      
      // Decrypt sensitive fields
      const decryptedContacts = encryptedContacts.map(contact => ({
        ...contact,
        name: decryptData(contact.name || ''),
        phone: decryptData(contact.phone || ''),
        email: contact.email ? decryptData(contact.email) : null,
      }));
      
      return decryptedContacts;
    } catch (error) {
      // Log failure
      auditLog('emergency_contact_access_failure', { 
        action: 'get_emergency_contacts',
        error: error.message,
        metadata: { clientId }
      });
      throw error;
    }
  },
  
  // Secure file upload with encryption
  secureFileUpload: async (entityType: string, entityId: string, fileType: string, file: File): Promise<FileUpload> => {
    try {
      // Log the action
      auditLog('file_upload_attempt', { 
        action: 'upload_file',
        metadata: { 
          entityType,
          entityId,
          fileType,
          fileName: file.name,
          fileSize: file.size
        }
      });
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('fileType', fileType);
      
      // Make secure API call with file data
      const response = await secureApiCall('POST', '/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Log successful upload
      auditLog('file_upload_success', { 
        action: 'upload_file',
        metadata: { 
          entityType,
          entityId,
          fileType,
          fileName: file.name,
          fileSize: file.size,
          uploadId: response.data.id
        }
      });
      
      return response.data;
    } catch (error) {
      // Log failure
      auditLog('file_upload_failure', { 
        action: 'upload_file',
        error: error.message,
        metadata: { 
          entityType,
          entityId,
          fileType,
          fileName: file.name,
          fileSize: file.size
        }
      });
      throw error;
    }
  }
};

// Helper function for secure file upload
const secureFileUpload = async (entityType: string, entityId: string, fileType: string, file: File): Promise<FileUpload> => {
  return secureClientService.secureFileUpload(entityType, entityId, fileType, file);
};

export default secureClientService;
