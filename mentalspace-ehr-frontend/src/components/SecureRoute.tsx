import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRBAC } from '../contexts/RBACContext';
import { useAuth } from '../hooks/useAuth';
import { auditService } from '../services/auditService';

interface SecureRouteProps {
  children: React.ReactNode;
  requiredPermissions: {
    resource: string;
    action: string;
  }[];
}

const SecureRoute: React.FC<SecureRouteProps> = ({ children, requiredPermissions }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { hasPermission, isLoading } = useRBAC();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Log unauthorized access attempt
    auditService.logEvent({
      action: 'UNAUTHORIZED_ACCESS',
      description: `Unauthenticated user attempted to access protected route: ${location.pathname}`,
      module: 'auth',
      severity: 'warning'
    });
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(
    ({ resource, action }) => hasPermission(resource, action)
  );

  if (!hasAllPermissions) {
    // Log unauthorized access attempt
    auditService.logEvent({
      action: 'PERMISSION_DENIED',
      description: `User attempted to access route without proper permissions: ${location.pathname}`,
      userId: user?.id,
      module: 'auth',
      severity: 'warning'
    });
    
    return <Navigate to="/unauthorized" replace />;
  }

  // Log successful access for sensitive routes
  const sensitiveRoutePatterns = [
    /\/clients\/\d+/,
    /\/notes\/\d+/,
    /\/billing/,
    /\/settings/
  ];
  
  if (sensitiveRoutePatterns.some(pattern => pattern.test(location.pathname))) {
    auditService.logEvent({
      action: 'ROUTE_ACCESS',
      description: `User accessed sensitive route: ${location.pathname}`,
      userId: user?.id,
      module: 'auth',
      severity: 'info'
    });
  }

  return <>{children}</>;
};

export default SecureRoute;
