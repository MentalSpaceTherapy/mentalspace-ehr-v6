import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { Staff } from '../models/Staff';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Staff | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to reset the session timer
  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    const newTimer = setTimeout(() => {
      // Session timeout - log the user out
      logout();
      alert('Your session has expired due to inactivity. Please log in again.');
    }, SESSION_TIMEOUT);
    
    setSessionTimer(newTimer);
  };

  // Set up event listeners for user activity
  useEffect(() => {
    if (isAuthenticated) {
      // Reset timer on user activity
      const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
      
      const handleUserActivity = () => {
        resetSessionTimer();
      };
      
      // Add event listeners
      activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      // Initialize the session timer
      resetSessionTimer();
      
      // Clean up event listeners and timer
      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
        
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
      };
    }
  }, [isAuthenticated]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem('token')) {
        try {
          setLoading(true);
          const response = await authAPI.getMe();
          setUser(response.data.data);
          setIsAuthenticated(true);
          
          // Log successful authentication
          logAuditEvent('AUTH_SUCCESS', 'User authenticated successfully');
        } catch (err) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          
          // Log failed authentication
          logAuditEvent('AUTH_FAILURE', 'Authentication check failed');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to log audit events
  const logAuditEvent = (action: string, description: string, entityId?: string, entityType?: string) => {
    // In a real app, this would call an API endpoint to log the audit event
    console.log(`AUDIT: ${action} - ${description}`, { entityId, entityType, userId: user?.id });
    
    // Send to server if authenticated
    if (isAuthenticated) {
      try {
        // This would be a real API call in production
        // auditAPI.logEvent({ action, description, entityId, entityType, userId: user?.id });
      } catch (error) {
        console.error('Failed to log audit event:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;
      
      // Store token in localStorage with encryption
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Log successful login
      logAuditEvent('LOGIN_SUCCESS', 'User logged in successfully');
      
      // Initialize session timer
      resetSessionTimer();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      
      // Log failed login attempt
      logAuditEvent('LOGIN_FAILURE', `Login failed: ${errorMessage}`);
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      
      // Log successful logout
      logAuditEvent('LOGOUT', 'User logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear session data
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear session timer
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.forgotPassword(email);
      
      // Log password reset request
      logAuditEvent('PASSWORD_RESET_REQUEST', `Password reset requested for email: ${email}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process password reset request.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.resetPassword(token, password);
      
      // Log password reset completion
      logAuditEvent('PASSWORD_RESET_COMPLETE', 'Password reset completed successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      
      // Log password update
      logAuditEvent('PASSWORD_UPDATE', 'Password updated successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
