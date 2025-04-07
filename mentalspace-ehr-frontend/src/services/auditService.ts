import axios from 'axios';
import { AuditLog } from '../models/AuditLog';

// Create an axios instance with default config for audit logging
const auditApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
auditApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get client information for audit logs
const getClientInfo = () => {
  return {
    ipAddress: 'client-side', // This will be replaced by the server
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
};

// Audit logging service
export const auditService = {
  // Log an audit event
  logEvent: async (params: {
    action: string;
    description: string;
    userId?: string;
    entityId?: string;
    entityType?: string;
    oldValue?: string;
    newValue?: string;
    module: AuditLog['module'];
    severity: AuditLog['severity'];
  }) => {
    const clientInfo = getClientInfo();
    
    const auditData = {
      ...params,
      ...clientInfo
    };
    
    try {
      return await auditApi.post('/auditlogs', auditData);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      
      // Store failed audit logs in localStorage for retry
      const failedLogs = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
      failedLogs.push(auditData);
      localStorage.setItem('failedAuditLogs', JSON.stringify(failedLogs));
      
      // Limit the number of stored failed logs to prevent localStorage overflow
      if (failedLogs.length > 100) {
        failedLogs.shift(); // Remove the oldest log
        localStorage.setItem('failedAuditLogs', JSON.stringify(failedLogs));
      }
    }
  },
  
  // Get audit logs with filtering
  getAuditLogs: async (params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    module?: AuditLog['module'];
    severity?: AuditLog['severity'];
    entityId?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) => {
    return await auditApi.get('/auditlogs', { params });
  },
  
  // Retry sending failed audit logs
  retryFailedLogs: async () => {
    const failedLogs = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
    
    if (failedLogs.length === 0) {
      return { success: true, message: 'No failed logs to retry' };
    }
    
    const successfulRetries = [];
    const remainingFailedLogs = [];
    
    for (const log of failedLogs) {
      try {
        await auditApi.post('/auditlogs', log);
        successfulRetries.push(log);
      } catch (error) {
        remainingFailedLogs.push(log);
      }
    }
    
    localStorage.setItem('failedAuditLogs', JSON.stringify(remainingFailedLogs));
    
    return {
      success: true,
      message: `Retried ${successfulRetries.length} logs, ${remainingFailedLogs.length} logs still pending`,
      retriedCount: successfulRetries.length,
      remainingCount: remainingFailedLogs.length
    };
  }
};

// Higher-order function to wrap API calls with audit logging
export const withAuditLogging = (
  apiCall: (...args: any[]) => Promise<any>,
  auditParams: {
    action: string;
    description: string;
    module: AuditLog['module'];
    severity: AuditLog['severity'];
    getEntityInfo?: (...args: any[]) => { entityId?: string; entityType?: string; };
    getValueChanges?: (...args: any[]) => { oldValue?: string; newValue?: string; };
  }
) => {
  return async (...args: any[]) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    
    // Prepare audit data
    const auditData = {
      action: auditParams.action,
      description: auditParams.description,
      userId,
      module: auditParams.module,
      severity: auditParams.severity
    };
    
    // Add entity information if provided
    if (auditParams.getEntityInfo) {
      const entityInfo = auditParams.getEntityInfo(...args);
      Object.assign(auditData, entityInfo);
    }
    
    // Add value changes if provided
    if (auditParams.getValueChanges) {
      const valueChanges = auditParams.getValueChanges(...args);
      Object.assign(auditData, valueChanges);
    }
    
    try {
      // Execute the API call
      const result = await apiCall(...args);
      
      // Log successful operation
      await auditService.logEvent({
        ...auditData,
        description: `${auditParams.description} - Success`
      });
      
      return result;
    } catch (error) {
      // Log failed operation
      await auditService.logEvent({
        ...auditData,
        description: `${auditParams.description} - Failed: ${(error as Error).message}`,
        severity: 'warning'
      });
      
      throw error;
    }
  };
};

export default auditService;
