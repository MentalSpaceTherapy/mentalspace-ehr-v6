import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clientAPI } from '../services/api';
import { Client } from '../models/Client';
import { InsurancePolicy } from '../models/InsurancePolicy';
import { ClientFlag } from '../models/ClientFlag';
import { Waitlist } from '../models/Waitlist';
import { EmergencyContact } from '../models/EmergencyContact';
import { FileUpload } from '../models/FileUpload';
import { useAuth } from './AuthContext';
import { ClientFormData, mapClientFormDataToApiModel } from '../models/ClientFormData';

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  insurancePolicies: InsurancePolicy[];
  emergencyContacts: EmergencyContact[];
  clientFlags: ClientFlag[];
  waitlist: Waitlist[];
  fileUploads: FileUpload[];
  loading: boolean;
  error: string | null;
  fetchClients: (query?: any) => Promise<void>;
  fetchClientById: (id: string) => Promise<Client>;
  createClient: (clientData: any) => Promise<Client>;
  updateClient: (id: string, clientData: any) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  fetchInsurancePolicies: (clientId: string) => Promise<void>;
  createInsurancePolicy: (clientId: string, policyData: any) => Promise<InsurancePolicy>;
  updateInsurancePolicy: (id: string, policyData: any) => Promise<InsurancePolicy>;
  deleteInsurancePolicy: (id: string) => Promise<void>;
  fetchEmergencyContacts: (clientId: string) => Promise<void>;
  createEmergencyContact: (clientId: string, contactData: any) => Promise<EmergencyContact>;
  updateEmergencyContact: (id: string, contactData: any) => Promise<EmergencyContact>;
  deleteEmergencyContact: (id: string) => Promise<void>;
  uploadFile: (entityType: string, entityId: string, fileType: string, file: File) => Promise<FileUpload>;
  fetchFileUploads: (entityType: string, entityId: string) => Promise<void>;
  deleteFileUpload: (id: string) => Promise<void>;
  fetchClientFlags: (clientId: string) => Promise<void>;
  createClientFlag: (clientId: string, flagData: any) => Promise<ClientFlag>;
  updateClientFlag: (id: string, flagData: any) => Promise<ClientFlag>;
  deleteClientFlag: (id: string) => Promise<void>;
  fetchWaitlist: (query?: any) => Promise<void>;
  createWaitlistItem: (waitlistData: any) => Promise<Waitlist>;
  updateWaitlistItem: (id: string, waitlistData: any) => Promise<Waitlist>;
  deleteWaitlistItem: (id: string) => Promise<void>;
  addContactAttempt: (waitlistId: string, contactData: any) => Promise<void>;
  createClientFromFormData: (formData: ClientFormData) => Promise<Client>;
  updateClientFromFormData: (id: string, formData: ClientFormData) => Promise<Client>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [clientFlags, setClientFlags] = useState<ClientFlag[]>([]);
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
      fetchWaitlist();
    }
  }, [isAuthenticated]);

  const fetchClients = async (query = {}) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getClients(query);
      setClients(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch clients. Please try again.';
      setError(errorMessage);
      console.error('Client fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getClientById(id);
      const clientData = response.data.data;
      setSelectedClient(clientData);
      return clientData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch client details. Please try again.';
      setError(errorMessage);
      console.error('Client fetch error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.createClient(clientData);
      const newClient = response.data.data;
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create client. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: string, clientData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.updateClient(id, clientData);
      const updatedClient = response.data.data;
      
      setClients(prev => 
        prev.map(client => client.id === id ? updatedClient : client)
      );
      
      if (selectedClient && selectedClient.id === id) {
        setSelectedClient(updatedClient);
      }
      
      return updatedClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update client. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      
      if (selectedClient && selectedClient.id === id) {
        setSelectedClient(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete client. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsurancePolicies = async (clientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getInsurancePolicies(clientId);
      setInsurancePolicies(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch insurance policies. Please try again.';
      setError(errorMessage);
      console.error('Insurance policies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInsurancePolicy = async (clientId: string, policyData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.createInsurancePolicy(clientId, policyData);
      const newPolicy = response.data.data;
      setInsurancePolicies(prev => [...prev, newPolicy]);
      return newPolicy;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create insurance policy. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateInsurancePolicy = async (id: string, policyData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.updateInsurancePolicy(id, policyData);
      const updatedPolicy = response.data.data;
      
      setInsurancePolicies(prev => 
        prev.map(policy => policy.id === id ? updatedPolicy : policy)
      );
      
      return updatedPolicy;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update insurance policy. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteInsurancePolicy = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteInsurancePolicy(id);
      setInsurancePolicies(prev => prev.filter(policy => policy.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete insurance policy. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Emergency Contacts
  const fetchEmergencyContacts = async (clientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getEmergencyContacts(clientId);
      setEmergencyContacts(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch emergency contacts. Please try again.';
      setError(errorMessage);
      console.error('Emergency contacts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEmergencyContact = async (clientId: string, contactData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.createEmergencyContact(clientId, contactData);
      const newContact = response.data.data;
      setEmergencyContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create emergency contact. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateEmergencyContact = async (id: string, contactData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.updateEmergencyContact(id, contactData);
      const updatedContact = response.data.data;
      
      setEmergencyContacts(prev => 
        prev.map(contact => contact.id === id ? updatedContact : contact)
      );
      
      return updatedContact;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update emergency contact. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmergencyContact = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteEmergencyContact(id);
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete emergency contact. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // File Uploads
  const uploadFile = async (entityType: string, entityId: string, fileType: string, file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.uploadFile(entityType, entityId, fileType, file);
      const newFile = response.data.data;
      setFileUploads(prev => [...prev, newFile]);
      return newFile;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileUploads = async (entityType: string, entityId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getFileUploads(entityType, entityId);
      setFileUploads(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch file uploads. Please try again.';
      setError(errorMessage);
      console.error('File uploads fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFileUpload = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteFileUpload(id);
      setFileUploads(prev => prev.filter(file => file.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete file. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientFlags = async (clientId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getClientFlags(clientId);
      setClientFlags(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch client flags. Please try again.';
      setError(errorMessage);
      console.error('Client flags fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createClientFlag = async (clientId: string, flagData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.createClientFlag(clientId, flagData);
      const newFlag = response.data.data;
      setClientFlags(prev => [...prev, newFlag]);
      return newFlag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create client flag. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateClientFlag = async (id: string, flagData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.updateClientFlag(id, flagData);
      const updatedFlag = response.data.data;
      
      setClientFlags(prev => 
        prev.map(flag => flag.id === id ? updatedFlag : flag)
      );
      
      return updatedFlag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update client flag. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteClientFlag = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteClientFlag(id);
      setClientFlags(prev => prev.filter(flag => flag.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete client flag. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlist = async (query = {}) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.getWaitlist(query);
      setWaitlist(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch waitlist. Please try again.';
      setError(errorMessage);
      console.error('Waitlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWaitlistItem = async (waitlistData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.createWaitlistItem(waitlistData);
      const newWaitlistItem = response.data.data;
      setWaitlist(prev => [...prev, newWaitlistItem]);
      return newWaitlistItem;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create waitlist item. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateWaitlistItem = async (id: string, waitlistData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientAPI.updateWaitlistItem(id, waitlistData);
      const updatedWaitlistItem = response.data.data;
      
      setWaitlist(prev => 
        prev.map(item => item.id === id ? updatedWaitlistItem : item)
      );
      
      return updatedWaitlistItem;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update waitlist item. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteWaitlistItem = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.deleteWaitlistItem(id);
      setWaitlist(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete waitlist item. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addContactAttempt = async (waitlistId: string, contactData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await clientAPI.addContactAttempt(waitlistId, contactData);
      // Refresh waitlist item to get updated contact attempts
      await fetchWaitlist();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add contact attempt. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper method to create client from form data
  const createClientFromFormData = async (formData: ClientFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Map form data to API models
      const { client: clientData, emergencyContact: contactData, insuranceCardFront, insuranceCardBack } = mapClientFormDataToApiModel(formData);
      
      // Create client
      const response = await clientAPI.createClient(clientData);
      const newClient = response.data.data;
      setClients(prev => [...prev, newClient]);
      
      // Create emergency contact
      if (contactData) {
        await createEmergencyContact(newClient.id, contactData);
      }
      
      // Create insurance policy if carrier is provided
      if (formData.insuranceCarrier) {
        const policyData = {
          carrier_name: formData.insuranceCarrier === 'Other' ? formData.insuranceCarrierOther : formData.insuranceCarrier,
          policy_number: formData.policyNumber,
          group_number: formData.groupNumber,
          coverage_start_date: formData.coverageStartDate,
          coverage_end_date: formData.coverageEndDate
        };
        
        const newPolicy = await createInsurancePolicy(newClient.id, policyData);
        
        // Upload insurance card images if provided
        if (insuranceCardFront) {
          await uploadFile('insurance_policy', newPolicy.id, 'insurance_card_front', insuranceCardFront);
        }
        
        if (insuranceCardBack) {
          await uploadFile('insurance_policy', newPolicy.id, 'insurance_card_back', insuranceCardBack);
        }
      }
      
      return newClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create client. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper method to update client from form data
  const updateClientFromFormData = async (id: string, formData: ClientFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Map form data to API models
      const { client: clientData, emergencyContact: contactData, insuranceCardFront, insuranceCardBack } = mapClientFormDataToApiModel(formData);
      
      // Update client
      const response = await clientAPI.updateClient(id, clientData);
      const updatedClient = response.data.data;
      
      setClients(prev => 
        prev.map(client => client.id === id ? updatedClient : client)
      );
      
      if (selectedClient && selectedClient.id === id) {
        setSelectedClient(updatedClient);
      }
      
      // Fetch existing emergency contacts
      await fetchEmergencyContacts(id);
      
      // Update or create emergency contact
      if (contactData) {
        if (emergencyContacts.length > 0) {
          // Update existing primary emergency contact
          const primaryContact = emergencyContacts.find(c => c.isPrimary);
          if (primaryContact) {
            await updateEmergencyContact(primaryContact.id!, contactData);
          } else {
            await createEmergencyContact(id, contactData);
          }
        } else {
          // Create new emergency contact
          await createEmergencyContact(id, contactData);
        }
      }
      
      // Fetch existing insurance policies
      await fetchInsurancePolicies(id);
      
      // Update or create insurance policy
      if (formData.insuranceCarrier) {
        const policyData = {
          carrier_name: formData.insuranceCarrier === 'Other' ? formData.insuranceCarrierOther : formData.insuranceCarrier,
          policy_number: formData.policyNumber,
          group_number: formData.groupNumber,
          coverage_start_date: formData.coverageStartDate,
          coverage_end_date: formData.coverageEndDate
        };
        
        if (insurancePolicies.length > 0) {
          // Update existing policy
          const policy = insurancePolicies[0]; // Assume first policy is the one to update
          await updateInsurancePolicy(policy.id!, policyData);
          
          // Upload new insurance card images if provided
          if (insuranceCardFront) {
            await uploadFile('insurance_policy', policy.id!, 'insurance_card_front', insuranceCardFront);
          }
          
          if (insuranceCardBack) {
            await uploadFile('insurance_policy', policy.id!, 'insurance_card_back', insuranceCardBack);
          }
        } else {
          // Create new policy
          const newPolicy = await createInsurancePolicy(id, policyData);
          
          // Upload insurance card images if provided
          if (insuranceCardFront) {
            await uploadFile('insurance_policy', newPolicy.id, 'insurance_card_front', insuranceCardFront);
          }
          
          if (insuranceCardBack) {
            await uploadFile('insurance_policy', newPolicy.id, 'insurance_card_back', insuranceCardBack);
          }
        }
      }
      
      return updatedClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update client. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        selectedClient,
        insurancePolicies,
        emergencyContacts,
        clientFlags,
        waitlist,
        fileUploads,
        loading,
        error,
        fetchClients,
        fetchClientById,
        createClient,
        updateClient,
        deleteClient,
        fetchInsurancePolicies,
        createInsurancePolicy,
        updateInsurancePolicy,
        deleteInsurancePolicy,
        fetchEmergencyContacts,
        createEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        uploadFile,
        fetchFileUploads,
        deleteFileUpload,
        fetchClientFlags,
        createClientFlag,
        updateClientFlag,
        deleteClientFlag,
        fetchWaitlist,
        createWaitlistItem,
        updateWaitlistItem,
        deleteWaitlistItem,
        addContactAttempt,
        createClientFromFormData,
        updateClientFromFormData
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export default ClientContext;
