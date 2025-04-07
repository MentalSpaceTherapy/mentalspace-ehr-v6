import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClientProvider } from '../contexts/ClientContext';
import { AuthProvider } from '../contexts/AuthContext';
import ClientDirectory from '../pages/clients/ClientDirectory';

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
  clientAPI: {
    getClients: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: '1990-05-15',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            gender: 'Male',
            pronouns: 'he/him',
            status: 'active',
            referralSource: 'Website',
            referralDate: '2023-01-10',
            flags: ['High priority'],
            createdAt: '2023-01-10T00:00:00.000Z',
            updatedAt: '2023-05-20T00:00:00.000Z'
          },
          {
            id: '2',
            firstName: 'Emily',
            lastName: 'Johnson',
            dateOfBirth: '1985-09-22',
            email: 'emily.johnson@example.com',
            phone: '(555) 987-6543',
            gender: 'Female',
            pronouns: 'she/her',
            status: 'active',
            referralSource: 'Doctor Referral',
            referralDate: '2022-11-05',
            flags: [],
            createdAt: '2022-11-05T00:00:00.000Z',
            updatedAt: '2023-04-15T00:00:00.000Z'
          },
          {
            id: '3',
            firstName: 'Michael',
            lastName: 'Williams',
            dateOfBirth: '1978-03-10',
            email: 'michael.williams@example.com',
            phone: '(555) 456-7890',
            gender: 'Male',
            pronouns: 'he/him',
            status: 'inactive',
            referralSource: 'Psychology Today',
            referralDate: '2022-08-20',
            flags: ['Insurance expired'],
            createdAt: '2022-08-20T00:00:00.000Z',
            updatedAt: '2023-01-10T00:00:00.000Z'
          }
        ]
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
        <ClientProvider>
          {ui}
        </ClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ClientDirectory Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('token', 'test-token');
    jest.clearAllMocks();
  });

  test('renders client directory with client list', async () => {
    renderWithProviders(<ClientDirectory />);
    
    // Check for loading state
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for client data to load
    await waitFor(() => {
      expect(screen.getByText(/Client Directory/i)).toBeInTheDocument();
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Emily Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Williams/i)).toBeInTheDocument();
    });
    
    // Check for status badges
    const activeStatuses = screen.getAllByText(/active/i);
    expect(activeStatuses.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
    
    // Check for flags
    expect(screen.getByText(/High priority/i)).toBeInTheDocument();
    expect(screen.getByText(/Insurance expired/i)).toBeInTheDocument();
  });

  test('filters clients by search term', async () => {
    renderWithProviders(<ClientDirectory />);
    
    // Wait for client data to load
    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
    });
    
    // Get search input and type in it
    const searchInput = screen.getByPlaceholderText(/Search by name, email, or phone/i);
    fireEvent.change(searchInput, { target: { value: 'Emily' } });
    
    // Check that only Emily Johnson is displayed
    expect(screen.getByText(/Emily Johnson/i)).toBeInTheDocument();
    expect(screen.queryByText(/John Smith/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Michael Williams/i)).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Check that all clients are displayed again
    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Emily Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Williams/i)).toBeInTheDocument();
    });
  });

  test('filters clients by status', async () => {
    renderWithProviders(<ClientDirectory />);
    
    // Wait for client data to load
    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
    });
    
    // Get status filter dropdown and select 'Inactive'
    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'inactive' } });
    
    // Check that only inactive clients are displayed
    expect(screen.queryByText(/John Smith/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Emily Johnson/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Michael Williams/i)).toBeInTheDocument();
    
    // Change filter to 'Active'
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    // Check that only active clients are displayed
    expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Emily Johnson/i)).toBeInTheDocument();
    expect(screen.queryByText(/Michael Williams/i)).not.toBeInTheDocument();
    
    // Reset filter to 'All'
    fireEvent.change(statusFilter, { target: { value: 'all' } });
    
    // Check that all clients are displayed again
    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Emily Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Michael Williams/i)).toBeInTheDocument();
    });
  });

  test('calculates age correctly', async () => {
    // Mock the current date to ensure consistent age calculation
    const mockDate = new Date('2023-06-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
    
    renderWithProviders(<ClientDirectory />);
    
    // Wait for client data to load
    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
    });
    
    // Check ages based on the mocked current date (2023-06-01)
    // John Smith: 1990-05-15 -> 33 years
    // Emily Johnson: 1985-09-22 -> 37 years
    // Michael Williams: 1978-03-10 -> 45 years
    expect(screen.getByText(/33 years/i)).toBeInTheDocument();
    expect(screen.getByText(/37 years/i)).toBeInTheDocument();
    expect(screen.getByText(/45 years/i)).toBeInTheDocument();
    
    // Restore the original Date implementation
    jest.restoreAllMocks();
  });

  test('handles API error gracefully', async () => {
    const { clientAPI } = require('../services/api');
    
    // Mock API to return an error
    clientAPI.getClients.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Failed to fetch client data'
        }
      }
    });
    
    renderWithProviders(<ClientDirectory />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch client data/i)).toBeInTheDocument();
    });
  });
});
