import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auditService } from '../services/auditService';
import { encryptionService } from '../services/encryptionService';

// HIPAA compliance component that enforces security policies
const HIPAACompliance: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check for HTTPS in production
  useEffect(() => {
    if (import.meta.env.PROD && window.location.protocol !== 'https:') {
      console.error('HIPAA Compliance Error: Application must be served over HTTPS in production');
      auditService.logEvent({
        action: 'SECURITY_VIOLATION',
        description: 'Attempted to access application over insecure protocol (HTTP)',
        module: 'auth',
        severity: 'critical'
      });
      
      // Redirect to HTTPS
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  // Enforce secure browser features
  useEffect(() => {
    // Check for localStorage/sessionStorage availability (private browsing mode)
    try {
      localStorage.setItem('hipaa_test', 'test');
      localStorage.removeItem('hipaa_test');
    } catch (e) {
      auditService.logEvent({
        action: 'STORAGE_UNAVAILABLE',
        description: 'Browser storage unavailable, possibly in private browsing mode',
        module: 'auth',
        severity: 'warning'
      });
      navigate('/browser-requirements');
    }

    // Set secure cookies
    document.cookie = 'hipaa_secure=1; secure; samesite=strict';
  }, []);

  // Enforce session inactivity timeout
  useEffect(() => {
    const lastActivity = encryptionService.secureRetrieve<string>('last_activity', false) as string;
    const currentTime = new Date().getTime();
    
    // If last activity was more than 15 minutes ago, log out
    if (lastActivity && (currentTime - parseInt(lastActivity)) > 15 * 60 * 1000) {
      auditService.logEvent({
        action: 'SESSION_TIMEOUT',
        description: 'User session timed out due to inactivity',
        module: 'auth',
        severity: 'info'
      });
      
      // Clear session data
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Redirect to login
      navigate('/login?timeout=true');
      return;
    }
    
    // Update last activity time
    encryptionService.secureStore('last_activity', currentTime.toString());
    
    // Set up activity listener
    const updateActivity = () => {
      encryptionService.secureStore('last_activity', new Date().getTime().toString());
    };
    
    // Track user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [location.pathname]);

  // Prevent data leakage
  useEffect(() => {
    // Disable browser features that could leak data
    if (navigator.serviceWorker && import.meta.env.PROD) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Disable browser caching for sensitive pages
    const sensitiveRoutes = ['/clients/', '/notes/', '/billing/'];
    if (sensitiveRoutes.some(route => location.pathname.includes(route))) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      document.getElementsByTagName('head')[0].appendChild(meta);
      
      const pragma = document.createElement('meta');
      pragma.httpEquiv = 'Pragma';
      pragma.content = 'no-cache';
      document.getElementsByTagName('head')[0].appendChild(pragma);
      
      const expires = document.createElement('meta');
      expires.httpEquiv = 'Expires';
      expires.content = '0';
      document.getElementsByTagName('head')[0].appendChild(expires);
    }
  }, [location.pathname]);

  // Log page views for audit trail
  useEffect(() => {
    auditService.logEvent({
      action: 'PAGE_VIEW',
      description: `User viewed page: ${location.pathname}`,
      module: 'auth',
      severity: 'info',
      entityType: 'page',
      entityId: location.pathname
    });
  }, [location.pathname]);

  return <>{children}</>;
};

export default HIPAACompliance;
