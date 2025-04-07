import axios from 'axios';
import { Staff } from '../models/Staff';
import { Client } from '../models/Client';
import { InsurancePolicy } from '../models/InsurancePolicy';
import { ClientFlag } from '../models/ClientFlag';
import { Waitlist } from '../models/Waitlist';
import { DashboardPreference } from '../models/DashboardPreference';
import { DashboardWidget } from '../models/DashboardWidget';
import { DashboardMetric } from '../models/DashboardMetric';
import { DashboardAlert } from '../models/DashboardAlert';
import { SupervisionRelationship } from '../models/SupervisionRelationship';
import { EmergencyContact } from '../models/EmergencyContact';
import { FileUpload } from '../models/FileUpload';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password } as LoginCredentials),
  
  register: (userData: RegisterData) => 
    api.post('/auth/register', userData),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgotpassword', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.put(`/auth/resetpassword/${token}`, { password }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  updatePassword: (currentPassword: string, newPassword: string) => 
    api.put('/auth/updatepassword', { currentPassword, newPassword } as PasswordData),
  
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

// Staff API
export const staffAPI = {
  getStaff: (query: Record<string, any> = {}) => 
    api.get('/staff', { params: query }),
  
  getStaffById: (id: string) => 
    api.get(`/staff/${id}`),
  
  createStaff: (staffData: Partial<Staff>) => 
    api.post('/staff', staffData),
  
  updateStaff: (id: string, staffData: Partial<Staff>) => 
    api.put(`/staff/${id}`, staffData),
  
  deleteStaff: (id: string) => 
    api.delete(`/staff/${id}`),
  
  getSupervisionRelationships: (query: Record<string, any> = {}) => 
    api.get('/supervisionrelationships', { params: query }),
  
  createSupervisionRelationship: (relationshipData: Partial<SupervisionRelationship>) => 
    api.post('/supervisionrelationships', relationshipData),
  
  updateSupervisionRelationship: (id: string, relationshipData: Partial<SupervisionRelationship>) => 
    api.put(`/supervisionrelationships/${id}`, relationshipData),
  
  deleteSupervisionRelationship: (id: string) => 
    api.delete(`/supervisionrelationships/${id}`)
};

// Client API
export const clientAPI = {
  getClients: (query: Record<string, any> = {}) => 
    api.get('/clients', { params: query }),
  
  getClientById: (id: string) => 
    api.get(`/clients/${id}`),
  
  createClient: (clientData: Partial<Client>) => 
    api.post('/clients', clientData),
  
  updateClient: (id: string, clientData: Partial<Client>) => 
    api.put(`/clients/${id}`, clientData),
  
  deleteClient: (id: string) => 
    api.delete(`/clients/${id}`),
  
  // Insurance Policies
  getInsurancePolicies: (clientId: string) => 
    api.get(`/clients/${clientId}/insurancepolicies`),
  
  createInsurancePolicy: (clientId: string, policyData: Partial<InsurancePolicy>) => 
    api.post(`/clients/${clientId}/insurancepolicies`, policyData),
  
  updateInsurancePolicy: (id: string, policyData: Partial<InsurancePolicy>) => 
    api.put(`/insurancepolicies/${id}`, policyData),
  
  deleteInsurancePolicy: (id: string) => 
    api.delete(`/insurancepolicies/${id}`),
  
  // Emergency Contacts
  getEmergencyContacts: (clientId: string) => 
    api.get(`/clients/${clientId}/emergencycontacts`),
  
  createEmergencyContact: (clientId: string, contactData: Partial<EmergencyContact>) => 
    api.post(`/clients/${clientId}/emergencycontacts`, contactData),
  
  updateEmergencyContact: (id: string, contactData: Partial<EmergencyContact>) => 
    api.put(`/emergencycontacts/${id}`, contactData),
  
  deleteEmergencyContact: (id: string) => 
    api.delete(`/emergencycontacts/${id}`),
  
  // File Uploads
  uploadFile: (entityType: string, entityId: string, fileType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    formData.append('fileType', fileType);
    
    return api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  getFileUploads: (entityType: string, entityId: string) => 
    api.get('/uploads', { params: { entityType, entityId } }),
  
  deleteFileUpload: (id: string) => 
    api.delete(`/uploads/${id}`),
  
  // Client Flags
  getClientFlags: (clientId: string) => 
    api.get(`/clients/${clientId}/flags`),
  
  createClientFlag: (clientId: string, flagData: Partial<ClientFlag>) => 
    api.post(`/clients/${clientId}/flags`, flagData),
  
  updateClientFlag: (id: string, flagData: Partial<ClientFlag>) => 
    api.put(`/clientflags/${id}`, flagData),
  
  deleteClientFlag: (id: string) => 
    api.delete(`/clientflags/${id}`),
  
  // Waitlist
  getWaitlist: (query: Record<string, any> = {}) => 
    api.get('/waitlist', { params: query }),
  
  getWaitlistItemById: (id: string) => 
    api.get(`/waitlist/${id}`),
  
  createWaitlistItem: (waitlistData: Partial<Waitlist>) => 
    api.post('/waitlist', waitlistData),
  
  updateWaitlistItem: (id: string, waitlistData: Partial<Waitlist>) => 
    api.put(`/waitlist/${id}`, waitlistData),
  
  deleteWaitlistItem: (id: string) => 
    api.delete(`/waitlist/${id}`),
  
  addContactAttempt: (waitlistId: string, contactData: { date: string; method: string; notes: string; outcome: string }) => 
    api.post(`/waitlist/${waitlistId}/contactattempts`, contactData)
};

// Dashboard API
export const dashboardAPI = {
  getDashboardPreference: () => 
    api.get('/dashboardpreferences/me'),
  
  updateDashboardPreference: (preferenceData: Partial<DashboardPreference>) => 
    api.put('/dashboardpreferences/me', preferenceData),
  
  getAvailableWidgets: () => 
    api.get('/dashboardwidgets'),
  
  getDashboardMetrics: (query: Record<string, any> = {}) => 
    api.get('/dashboardmetrics', { params: query }),
  
  getDashboardAlerts: () => 
    api.get('/dashboardalerts'),
  
  dismissAlert: (alertId: string) => 
    api.put(`/dashboardalerts/${alertId}/dismiss`),
  
  // Dashboard data endpoints
  getUpcomingAppointments: (days = 7) => 
    api.get('/dashboard/appointments', { params: { days } }),
  
  getRecentClients: (limit = 5) => 
    api.get('/dashboard/clients/recent', { params: { limit } }),
  
  getDocumentationDue: (days = 7) => 
    api.get('/dashboard/documentation/due', { params: { days } }),
  
  getUnreadMessages: () => 
    api.get('/dashboard/messages/unread'),
  
  getBillingSummary: (timeRange = 'month') => 
    api.get('/dashboard/billing/summary', { params: { timeRange } }),
  
  getPendingTasks: () => 
    api.get('/dashboard/tasks/pending'),
  
  getPerformanceMetrics: (timeRange = 'month') => 
    api.get('/dashboard/metrics/performance', { params: { timeRange } })
};

export default api;
