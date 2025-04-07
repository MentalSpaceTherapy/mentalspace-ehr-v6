import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StaffProvider } from '../contexts/StaffContext';
import { AuthProvider } from '../contexts/AuthContext';
import StaffDirectory from '../pages/staff/StaffDirectory';

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
  staffAPI: {
    getStaff: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            title: 'Therapist',
            role: 'clinician',
            status: 'active',
            hireDate: '2022-01-15',
            createdAt: '2022-01-15T00:00:00.000Z',
            updatedAt: '2023-05-20T00:00:00.000Z'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '(555) 987-6543',
            title: 'Clinical Supervisor',
            role: 'supervisor',
            status: 'active',
            hireDate: '2021-06-10',
            createdAt: '2021-06-10T00:00:00.000Z',
            updatedAt: '2023-04-15T00:00:00.000Z'
          },
          {
            id: '3',
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael.johnson@example.com',
            phone: '(555) 456-7890',
            title: 'Intake Coordinator',
            role: 'scheduler',
            status: 'inactive',
            hireDate: '2020-03-22',
            createdAt: '2020-03-22T00:00:00.000Z',
            updatedAt: '2023-01-10T00:00:00.000Z'
          }
        ]
      }
    }),
    getSupervisionRelationships: jest.fn().mockResolvedValue({
      data: {
        data: []
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
        <StaffProvider>
          {ui}
        </StaffProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('StaffDirectory Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('token', 'test-token');
    jest.clearAllMocks();
  });

  test('renders staff directory with staff list', async () => {
    renderWithProviders(<StaffDirectory />);
    
    // Check for loading state
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for staff data to load
    await waitFor(() => {
      expect(screen.getByText(/Staff Directory/i)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Johnson/i)).toBeInTheDocument();
    });
    
    // Check for role badges
    expect(screen.getByText(/clinician/i)).toBeInTheDocument();
    expect(screen.getByText(/supervisor/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduler/i)).toBeInTheDocument();
    
    // Check for status badges
    const activeStatuses = screen.getAllByText(/active/i);
    expect(activeStatuses.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  test('filters staff by search term', async () => {
    renderWithProviders(<StaffDirectory />);
    
    // Wait for staff data to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
    
    // Get search input and type in it
    const searchInput = screen.getByPlaceholderText(/Search by name, email, or title/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // Check that only Jane Smith is displayed
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Michael Johnson/i)).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Check that all staff are displayed again
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Johnson/i)).toBeInTheDocument();
    });
  });

  test('filters staff by status', async () => {
    renderWithProviders(<StaffDirectory />);
    
    // Wait for staff data to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
    
    // Get status filter dropdown and select 'Inactive'
    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'inactive' } });
    
    // Check that only inactive staff are displayed
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Michael Johnson/i)).toBeInTheDocument();
    
    // Change filter to 'Active'
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    // Check that only active staff are displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/Michael Johnson/i)).not.toBeInTheDocument();
    
    // Reset filter to 'All'
    fireEvent.change(statusFilter, { target: { value: 'all' } });
    
    // Check that all staff are displayed again
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Johnson/i)).toBeInTheDocument();
    });
  });

  test('filters staff by role', async () => {
    renderWithProviders(<StaffDirectory />);
    
    // Wait for staff data to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
    
    // Get role filter dropdown and select 'Supervisor'
    const roleFilter = screen.getByLabelText(/Role/i);
    fireEvent.change(roleFilter, { target: { value: 'supervisor' } });
    
    // Check that only supervisors are displayed
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/Michael Johnson/i)).not.toBeInTheDocument();
    
    // Change filter to 'Clinician'
    fireEvent.change(roleFilter, { target: { value: 'clinician' } });
    
    // Check that only clinicians are displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Michael Johnson/i)).not.toBeInTheDocument();
    
    // Reset filter to 'All'
    fireEvent.change(roleFilter, { target: { value: 'all' } });
    
    // Check that all staff are displayed again
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Johnson/i)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const { staffAPI } = require('../services/api');
    
    // Mock API to return an error
    staffAPI.getStaff.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Failed to fetch staff data'
        }
      }
    });
    
    renderWithProviders(<StaffDirectory />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch staff data/i)).toBeInTheDocument();
    });
  });
});
