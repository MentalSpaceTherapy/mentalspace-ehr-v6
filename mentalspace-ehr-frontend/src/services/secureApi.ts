import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { encryptionService } from './encryptionService';
import { auditService } from './auditService';

// Create a secure axios instance with enhanced security features
const secureApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'X-Requested-With': 'XMLHttpRequest' // Helps prevent CSRF
  },
  withCredentials: true, // Enable sending cookies with requests
  timeout: 30000 // 30 second timeout
});

// Request interceptor for adding security headers and token
secureApi.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add authorization token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for replay protection
    const timestamp = new Date().toISOString();
    config.headers = config.headers || {};
    config.headers['X-Request-Timestamp'] = timestamp;
    
    // Add request ID for tracing
    const requestId = encryptionService.generateToken(16);
    config.headers['X-Request-ID'] = requestId;
    
    // For sensitive endpoints, encrypt request body
    const sensitiveEndpoints = [
      '/auth/login',
      '/auth/resetpassword',
      '/auth/updatepassword',
      '/clients',
      '/notes'
    ];
    
    if (config.data && 
        config.url && 
        sensitiveEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      try {
        // Store original data for logging
        const originalData = { ...config.data };
        
        // Remove sensitive fields from logging
        const sanitizedData = { ...originalData };
        ['password', 'ssn', 'creditCard', 'diagnosis'].forEach(field => {
          if (field in sanitizedData) {
            sanitizedData[field] = '[REDACTED]';
          }
        });
        
        // Log the API request (with sanitized data)
        auditService.logEvent({
          action: 'API_REQUEST',
          description: `API request to ${config.url}`,
          module: 'auth',
          severity: 'info',
          entityType: 'api',
          entityId: config.url,
          newValue: JSON.stringify(sanitizedData)
        });
        
        // For extra sensitive endpoints, encrypt the entire payload
        if (config.url.includes('/auth/') || config.url.includes('/clients/')) {
          config.data = {
            encryptedData: encryptionService.encryptObject(config.data)
          };
        }
      } catch (error) {
        console.error('Error in request interceptor:', error);
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Log failed requests
    auditService.logEvent({
      action: 'API_REQUEST_ERROR',
      description: `API request failed: ${error.message}`,
      module: 'auth',
      severity: 'warning'
    });
    
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and security checks
secureApi.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check for security headers
    const securityHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options'
    ];
    
    const missingHeaders = securityHeaders.filter(
      header => !response.headers[header.toLowerCase()]
    );
    
    if (missingHeaders.length > 0) {
      console.warn('Security headers missing from response:', missingHeaders);
    }
    
    // Log successful API responses for sensitive endpoints
    if (response.config.url && 
        ['/auth/', '/clients/', '/notes/'].some(path => response.config.url?.includes(path))) {
      auditService.logEvent({
        action: 'API_RESPONSE',
        description: `Received response from ${response.config.url}`,
        module: 'auth',
        severity: 'info',
        entityType: 'api',
        entityId: response.config.url
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      
      // Log authentication failure
      auditService.logEvent({
        action: 'AUTHENTICATION_FAILURE',
        description: 'Authentication token expired or invalid',
        module: 'auth',
        severity: 'warning'
      });
      
      // Redirect to login page
      window.location.href = '/login?session=expired';
    }
    
    // Handle forbidden errors
    if (error.response?.status === 403) {
      auditService.logEvent({
        action: 'AUTHORIZATION_FAILURE',
        description: `User attempted to access forbidden resource: ${error.config?.url}`,
        module: 'auth',
        severity: 'warning'
      });
    }
    
    // Handle server errors
    if (error.response?.status && error.response.status >= 500) {
      auditService.logEvent({
        action: 'SERVER_ERROR',
        description: `Server error occurred: ${error.message}`,
        module: 'auth',
        severity: 'critical',
        entityType: 'api',
        entityId: error.config?.url
      });
    }
    
    // Log all API errors
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', errorMessage, error.config?.url);
    
    return Promise.reject(error);
  }
);

export default secureApi;
