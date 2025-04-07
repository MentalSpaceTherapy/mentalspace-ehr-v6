import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';

interface RoleBasedRouteProps {
  requiredModule: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ requiredModule }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = useRole();
  const location = useLocation();

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has permission for this module
  if (!hasPermission(requiredModule as any)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default RoleBasedRoute;
