import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

// Define the possible roles in the system
export type UserRole = 'admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor';

// Define which modules each role has access to
interface RolePermissions {
  dashboard: boolean;
  clients: boolean;
  documentation: boolean;
  schedule: boolean;
  messaging: boolean;
  billing: boolean;
  settings: boolean;
  staff: boolean;
}

const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  admin: {
    dashboard: true,
    clients: true,
    documentation: true,
    schedule: true,
    messaging: true,
    billing: true,
    settings: true,
    staff: true
  },
  clinician: {
    dashboard: true,
    clients: true,
    documentation: true,
    schedule: true,
    messaging: true,
    billing: false,
    settings: false,
    staff: false
  },
  scheduler: {
    dashboard: true,
    clients: true,
    documentation: false,
    schedule: true,
    messaging: true,
    billing: false,
    settings: false,
    staff: false
  },
  biller: {
    dashboard: true,
    clients: true,
    documentation: false,
    schedule: false,
    messaging: true,
    billing: true,
    settings: false,
    staff: false
  },
  supervisor: {
    dashboard: true,
    clients: true,
    documentation: true,
    schedule: true,
    messaging: true,
    billing: true,
    settings: false,
    staff: true
  }
};

interface RoleContextType {
  userRole: UserRole;
  hasPermission: (module: keyof RolePermissions) => boolean;
  rolePermissions: RolePermissions;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // Default to clinician if no role is specified
  const userRole = (user?.role as UserRole) || 'clinician';
  
  // Get permissions for the current role
  const rolePermissions = rolePermissionsMap[userRole] || rolePermissionsMap.clinician;
  
  // Function to check if user has permission for a specific module
  const hasPermission = (module: keyof RolePermissions) => {
    return rolePermissions[module];
  };
  
  const value = {
    userRole,
    hasPermission,
    rolePermissions
  };
  
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
