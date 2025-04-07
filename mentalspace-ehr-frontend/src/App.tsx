import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ClientProvider } from './contexts/ClientContext';
import { StaffProvider } from './contexts/StaffContext';
import { DocumentationProvider } from './contexts/DocumentationContext';
import { RBACProvider } from './contexts/RBACContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RBACProvider>
          <StaffProvider>
            <ClientProvider>
              <DashboardProvider>
                <DocumentationProvider>
                  <AppRoutes />
                </DocumentationProvider>
              </DashboardProvider>
            </ClientProvider>
          </StaffProvider>
        </RBACProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
