import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dashboardAPI } from '../services/api';
import { DashboardWidget } from '../models/DashboardWidget';
import { DashboardPreference } from '../models/DashboardPreference';
import { DashboardMetric } from '../models/DashboardMetric';
import { DashboardAlert } from '../models/DashboardAlert';
import { useAuth } from '../hooks/useAuth';

interface DashboardContextType {
  widgets: DashboardWidget[];
  alerts: DashboardAlert[];
  preferences: DashboardPreference | null;
  metrics: Record<string, any>;
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  updatePreferences: (preferences: Partial<DashboardPreference>) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  fetchWidgetData: (widgetType: string, params?: Record<string, any>) => Promise<any>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [preferences, setPreferences] = useState<DashboardPreference | null>(null);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch dashboard preferences
      const preferencesResponse = await dashboardAPI.getDashboardPreference();
      setPreferences(preferencesResponse.data.data);
      
      // Fetch available widgets
      const widgetsResponse = await dashboardAPI.getAvailableWidgets();
      setWidgets(widgetsResponse.data.data);
      
      // Fetch dashboard alerts
      const alertsResponse = await dashboardAPI.getDashboardAlerts();
      setAlerts(alertsResponse.data.data);
      
      // Fetch dashboard metrics
      const metricsResponse = await dashboardAPI.getDashboardMetrics();
      setMetrics(metricsResponse.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data. Please try again.';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const updatePreferences = async (newPreferences: Partial<DashboardPreference>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dashboardAPI.updateDashboardPreference(newPreferences);
      setPreferences(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update dashboard preferences. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await dashboardAPI.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err: any) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const fetchWidgetData = async (widgetType: string, params?: Record<string, any>) => {
    try {
      let response;
      
      switch (widgetType) {
        case 'appointments':
          response = await dashboardAPI.getUpcomingAppointments(params?.days);
          break;
        case 'clients':
          response = await dashboardAPI.getRecentClients(params?.limit);
          break;
        case 'notes':
          response = await dashboardAPI.getDocumentationDue(params?.days);
          break;
        case 'messages':
          response = await dashboardAPI.getUnreadMessages();
          break;
        case 'billing':
          response = await dashboardAPI.getBillingSummary(params?.timeRange);
          break;
        case 'tasks':
          response = await dashboardAPI.getPendingTasks();
          break;
        case 'metrics':
          response = await dashboardAPI.getPerformanceMetrics(params?.timeRange);
          break;
        default:
          throw new Error(`Unknown widget type: ${widgetType}`);
      }
      
      return response.data.data;
    } catch (err: any) {
      console.error(`Failed to fetch data for widget type ${widgetType}:`, err);
      throw err;
    }
  };

  const value = {
    widgets,
    alerts,
    preferences,
    metrics,
    loading,
    error,
    fetchDashboardData,
    updatePreferences,
    dismissAlert,
    fetchWidgetData
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
};
