import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './components/Dashboard';
import StaffDirectory from './pages/staff/StaffDirectory';
import StaffProfile from './pages/staff/StaffProfile';
import ClientDirectory from './pages/clients/ClientDirectory';
import ClientProfile from './pages/clients/ClientProfile';
import WaitlistManagement from './pages/clients/WaitlistManagement';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import DocumentationIndex from './pages/documentation/index';
import IntakeNoteForm from './pages/documentation/IntakeNoteForm';
import ProgressNoteForm from './pages/documentation/ProgressNoteForm';
import TreatmentPlanNoteForm from './pages/documentation/TreatmentPlanNoteForm';
import DischargeNoteForm from './pages/documentation/DischargeNoteForm';
import CancellationNoteForm from './pages/documentation/CancellationNoteForm';
import ContactNoteForm from './pages/documentation/ContactNoteForm';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* App Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Staff Routes */}
          <Route path="staff" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'CLINICAL_DIRECTOR', 'SUPERVISOR']}>
              <StaffDirectory />
            </RoleBasedRoute>
          } />
          <Route path="staff/:id" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'CLINICAL_DIRECTOR', 'SUPERVISOR']}>
              <StaffProfile />
            </RoleBasedRoute>
          } />
          
          {/* Client Routes */}
          <Route path="clients" element={<ClientDirectory />} />
          <Route path="clients/:id" element={<ClientProfile />} />
          <Route path="waitlist" element={
            <RoleBasedRoute allowedRoles={['ADMIN', 'CLINICAL_DIRECTOR', 'INTAKE_COORDINATOR']}>
              <WaitlistManagement />
            </RoleBasedRoute>
          } />
          
          {/* Documentation Routes */}
          <Route path="documentation" element={<DocumentationIndex />} />
          <Route path="documentation/intake-note/new" element={<IntakeNoteForm />} />
          <Route path="documentation/intake-note/:id" element={<IntakeNoteForm />} />
          <Route path="documentation/progress-note/new" element={<ProgressNoteForm />} />
          <Route path="documentation/progress-note/:id" element={<ProgressNoteForm />} />
          <Route path="documentation/treatment-plan/new" element={<TreatmentPlanNoteForm />} />
          <Route path="documentation/treatment-plan/:id" element={<TreatmentPlanNoteForm />} />
          <Route path="documentation/discharge-note/new" element={<DischargeNoteForm />} />
          <Route path="documentation/discharge-note/:id" element={<DischargeNoteForm />} />
          <Route path="documentation/cancellation-note/new" element={<CancellationNoteForm />} />
          <Route path="documentation/cancellation-note/:id" element={<CancellationNoteForm />} />
          <Route path="documentation/contact-note/new" element={<ContactNoteForm />} />
          <Route path="documentation/contact-note/:id" element={<ContactNoteForm />} />
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Catch-all redirect to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
