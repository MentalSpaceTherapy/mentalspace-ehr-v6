import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Staff } from '../models/Staff';
import { auditService } from '../services/auditService';

// Define the roles and their permissions
export const ROLE_PERMISSIONS = {
  admin: {
    staff: ['read', 'create', 'update', 'delete'],
    client: ['read', 'create', 'update', 'delete'],
    appointment: ['read', 'create', 'update', 'delete'],
    note: ['read', 'create', 'update', 'delete'],
    billing: ['read', 'create', 'update', 'delete'],
    message: ['read', 'create', 'update', 'delete'],
    setting: ['read', 'create', 'update', 'delete'],
    report: ['read', 'create', 'update', 'delete'],
    dashboard: ['read', 'create', 'update', 'delete'],
    audit: ['read']
  },
  clinician: {
    staff: ['read'],
    client: ['read', 'create', 'update'],
    appointment: ['read', 'create', 'update'],
    note: ['read', 'create', 'update'],
    billing: ['read', 'create'],
    message: ['read', 'create', 'update'],
    setting: ['read'],
    report: ['read'],
    dashboard: ['read', 'update'],
    audit: []
  },
  supervisor: {
    staff: ['read'],
    client: ['read', 'create', 'update'],
    appointment: ['read', 'create', 'update'],
    note: ['read', 'create', 'update', 'approve'],
    billing: ['read', 'create', 'update'],
    message: ['read', 'create', 'update'],
    setting: ['read'],
    report: ['read', 'create'],
    dashboard: ['read', 'update'],
    audit: ['read']
  },
  scheduler: {
    staff: ['read'],
    client: ['read', 'create', 'update'],
    appointment: ['read', 'create', 'update', 'delete'],
    note: ['read'],
    billing: [],
    message: ['read', 'create', 'update'],
    setting: ['read'],
    report: ['read'],
    dashboard: ['read', 'update'],
    audit: []
  },
  biller: {
    staff: ['read'],
    client: ['read', 'update'],
    appointment: ['read'],
    note: ['read'],
    billing: ['read', 'create', 'update', 'delete'],
    message: ['read', 'create', 'update'],
    setting: ['read'],
    report: ['read', 'create'],
    dashboard: ['read', 'update'],
    audit: []
  }
};

// Define the types for the context
interface RBACContextType {
  hasPermission: (resource: string, action: string) => boolean;
  userRole: string | null;
  isLoading: boolean;
}

// Create the context
const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Create the provider component
export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        setUserRole(user.role);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    }
  }, [user, isAuthenticated, loading]);

  // Function to check if the user has permission for a specific action on a resource
  const hasPermission = (resource: string, action: string): boolean => {
    if (!userRole || !isAuthenticated) {
      return false;
    }

    // Get the permissions for the user's role
    const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    
    if (!rolePermissions) {
      // Log unauthorized access attempt
      auditService.logEvent({
        action: 'UNAUTHORIZED_ACCESS',
        description: `User with unknown role "${userRole}" attempted to access ${resource} with action ${action}`,
        userId: user?.id,
        module: 'auth',
        severity: 'warning'
      });
      return false;
    }

    // Get the permissions for the specific resource
    const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
    
    if (!resourcePermissions) {
      // Log unauthorized access attempt
      auditService.logEvent({
        action: 'UNAUTHORIZED_ACCESS',
        description: `User attempted to access unauthorized resource "${resource}" with action ${action}`,
        userId: user?.id,
        module: 'auth',
        severity: 'warning'
      });
      return false;
    }

    // Check if the action is allowed
    const hasAccess = resourcePermissions.includes(action);
    
    // Log access attempts for sensitive resources
    if (['client', 'note', 'billing'].includes(resource)) {
      auditService.logEvent({
        action: hasAccess ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
        description: `User ${hasAccess ? 'granted' : 'denied'} ${action} access to ${resource}`,
        userId: user?.id,
        module: 'auth',
        severity: hasAccess ? 'info' : 'warning'
      });
    }
    
    return hasAccess;
  };

  const value = {
    hasPermission,
    userRole,
    isLoading
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

// Create a hook to use the RBAC context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  
  return context;
};
