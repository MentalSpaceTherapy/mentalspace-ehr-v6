import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardProvider } from '../contexts/DashboardContext';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from '../components/dashboard/Dashboard';

// Mock the API service
jest.mock('../services/api', () => ({
  authAPI: {
    getMe: jest.fn().mockResolvedValue({
      data: {
        data: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        }
      }
    })
  },
  dashboardAPI: {
    getDashboardPreference: jest.fn().mockResolvedValue({
      data: {
        data: {
          id: '1',
          staffId: '1',
          layout: 'grid',
          theme: 'light',
          defaultView: 'dashboard',
          widgets: ['1', '2', '3', '4', '5'],
          widgetPositions: [
            { widgetId: '1', position: 0, size: 'medium' },
            { widgetId: '2', position: 1, size: 'medium' },
            { widgetId: '3', position: 2, size: 'medium' },
            { widgetId: '4', position: 3, size: 'small' },
            { widgetId: '5', position: 4, size: 'medium' }
          ],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-05-15T00:00:00.000Z'
        }
      }
    }),
    getAvailableWidgets: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: '1',
            name: 'Upcoming Appointments',
            type: 'appointments',
            description: 'Shows your upcoming appointments for today and tomorrow',
            icon: 'Calendar',
            availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor'],
            defaultSize: 'medium',
            refreshInterval: 300,
            settings: {
              showCancelled: false,
              daysToShow: 2
            },
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: '2',
            name: 'Recent Clients',
            type: 'clients',
            description: 'Shows recently viewed or updated clients',
            icon: 'Users',
            availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor', 'biller'],
            defaultSize: 'medium',
            refreshInterval: 600,
            settings: {
              limit: 5,
              sortBy: 'lastViewed'
            },
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: '3',
            name: 'Documentation Due',
            type: 'notes',
            description: 'Shows notes that are due or overdue',
            icon: 'FileText',
            availableForRoles: ['admin', 'clinician', 'supervisor'],
            defaultSize: 'medium',
            refreshInterval: 900,
            settings: {
              showOverdueOnly: false,
              daysToShow: 7
            },
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: '4',
            name: 'Unread Messages',
            type: 'messages',
            description: 'Shows unread messages and notifications',
            icon: 'MessageSquare',
            availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor', 'biller'],
            defaultSize: 'small',
            refreshInterval: 60,
            settings: {
              groupByThread: true,
              showNotifications: true
            },
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: '5',
            name: 'Billing Summary',
            type: 'billing',
            description: 'Shows billing and payment summary',
            icon: 'DollarSign',
            availableForRoles: ['admin', 'biller', 'supervisor'],
            defaultSize: 'medium',
            refreshInterval: 1800,
            settings: {
              timeRange: 'month',
              showUnpaid: true
            },
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          }
        ]
      }
    }),
    getDashboardAlerts: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: '1',
            title: 'Documentation Overdue',
            message: 'You have 3 notes that are overdue for completion.',
            type: 'warning',
            priority: 'high',
            isRead: false,
            isDismissed: false,
            targetRoles: ['clinician', 'supervisor'],
            relatedEntityType: 'note',
            actionUrl: '/documentation',
            actionText: 'View Notes',
            createdAt: new Date('2023-11-15'),
            updatedAt: new Date('2023-11-15')
          },
          {
            id: '2',
            title: 'New Messages',
            message: 'You have 2 unread messages from clients.',
            type: 'info',
            priority: 'medium',
            isRead: false,
            isDismissed: false,
            targetRoles: ['clinician', 'admin', 'supervisor'],
            relatedEntityType: 'client',
            actionUrl: '/messages',
            actionText: 'View Messages',
            createdAt: new Date('2023-11-16'),
            updatedAt: new Date('2023-11-16')
          }
        ]
      }
    }),
    getDashboardMetrics: jest.fn().mockResolvedValue({
      data: {
        data: {
          appointments: {
            total: 120,
            completed: 95,
            cancelled: 15,
            noShow: 10,
            utilization: 0.85
          },
          clients: {
            active: 85,
            inactive: 30,
            waitlist: 12,
            newThisMonth: 8
          },
          billing: {
            revenue: 15250.75,
            outstanding: 4320.50,
            insurancePending: 8750.25,
            collectionsRate: 0.92
          },
          documentation: {
            completed: 110,
            pending: 15,
            overdue: 5,
            completionRate: 0.88
          }
        }
      }
    }),
    dismissAlert: jest.fn().mockResolvedValue({
      data: {
        success: true
      }
    })
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          {ui}
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('token', 'test-token');
    jest.clearAllMocks();
  });

  test('renders dashboard with role-specific title', async () => {
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Check for loading state
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard with different titles based on role', async () => {
    // Admin role
    const { unmount } = renderWithProviders(<Dashboard userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
    unmount();
    
    // Clinician role
    renderWithProviders(<Dashboard userRole="clinician" />);
    await waitFor(() => {
      expect(screen.getByText(/Clinician Dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard alerts', async () => {
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
    
    // Check for alerts
    expect(screen.getByText(/Documentation Overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/You have 3 notes that are overdue for completion./i)).toBeInTheDocument();
    expect(screen.getByText(/New Messages/i)).toBeInTheDocument();
    expect(screen.getByText(/You have 2 unread messages from clients./i)).toBeInTheDocument();
  });

  test('dismisses alerts when clicked', async () => {
    const { dashboardAPI } = require('../services/api');
    
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
    
    // Find and click dismiss button for first alert
    const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
    fireEvent.click(dismissButtons[0]);
    
    // Check that API was called with correct alert ID
    await waitFor(() => {
      expect(dashboardAPI.dismissAlert).toHaveBeenCalledWith('1');
    });
    
    // Check that alert is no longer displayed
    expect(screen.queryByText(/Documentation Overdue/i)).not.toBeInTheDocument();
    
    // Second alert should still be visible
    expect(screen.getByText(/New Messages/i)).toBeInTheDocument();
  });

  test('renders widgets based on user role', async () => {
    // Admin role should see all widgets
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
    
    // Check for widgets
    expect(screen.getByText(/Upcoming Appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Clients/i)).toBeInTheDocument();
    expect(screen.getByText(/Documentation Due/i)).toBeInTheDocument();
    expect(screen.getByText(/Unread Messages/i)).toBeInTheDocument();
    expect(screen.getByText(/Billing Summary/i)).toBeInTheDocument();
  });

  test('toggles customize mode when customize button is clicked', async () => {
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Wait for dashboard data to load
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
    
    // Find and click customize button
    const customizeButton = screen.getByRole('button', { name: /Customize Dashboard/i });
    fireEvent.click(customizeButton);
    
    // Check that customize mode is active
    expect(screen.getByText(/Add Widget/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
    
    // Click done button to exit customize mode
    const doneButton = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneButton);
    
    // Check that customize mode is inactive
    expect(screen.queryByText(/Add Widget/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customize Dashboard/i })).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    const { dashboardAPI } = require('../services/api');
    
    // Mock API to return an error
    dashboardAPI.getAvailableWidgets.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Failed to load dashboard data. Please try again.'
        }
      }
    });
    
    renderWithProviders(<Dashboard userRole="admin" />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data. Please try again./i)).toBeInTheDocument();
    });
  });
});
