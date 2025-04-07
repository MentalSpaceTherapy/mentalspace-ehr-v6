import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClientProvider } from '../../contexts/ClientContext';
import { AuthProvider } from '../../contexts/AuthContext';
import ClientForm from '../../pages/clients/forms/ClientForm';
import * as secureClientService from '../../services/secureClientService';

// Mock the secure client service
jest.mock('../../services/secureClientService', () => ({
  createClient: jest.fn(),
  updateClient: jest.fn(),
  getClient: jest.fn(),
  getEmergencyContacts: jest.fn(),
  secureFileUpload: jest.fn()
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: undefined })
}));

describe('ClientForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderClientForm = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ClientProvider>
            <ClientForm />
          </ClientProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders the client form with all steps', () => {
    renderClientForm();
    
    // Check if the form title is rendered
    expect(screen.getByText('Add New Client')).toBeInTheDocument();
    
    // Check if the first step is active
    expect(screen.getByText('Basic Demographics')).toBeInTheDocument();
    
    // Check for required fields in the first step
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
  });

  test('validates required fields before proceeding to next step', async () => {
    renderClientForm();
    
    // Try to proceed without filling required fields
    fireEvent.click(screen.getByText('Next'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      expect(screen.getByText('Gender is required')).toBeInTheDocument();
    });
  });

  test('allows navigation between steps when required fields are filled', async () => {
    renderClientForm();
    
    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });
    fireEvent.click(screen.getByLabelText(/Male/i));
    
    // Proceed to next step
    fireEvent.click(screen.getByText('Next'));
    
    // Check if we're on step 2
    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
    });
  });

  test('submits the form with all required data', async () => {
    // Mock the createClient function to resolve successfully
    (secureClientService.createClient as jest.Mock).mockResolvedValue({ id: '123', firstName: 'John', lastName: 'Doe' });
    
    renderClientForm();
    
    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });
    fireEvent.click(screen.getByLabelText(/Male/i));
    
    // Proceed to step 2
    fireEvent.click(screen.getByText('Next'));
    
    // Fill out required fields in step 2
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-123-4567' } });
      fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Anytown' } });
      fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '12345' } });
    });
    
    // Proceed to step 3
    fireEvent.click(screen.getByText('Next'));
    
    // Skip insurance (optional) and proceed to step 4
    await waitFor(() => {
      expect(screen.getByText('Insurance Information')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));
    
    // Fill out required fields in step 4
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Emergency Contact Name/i), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText(/Relationship/i), { target: { value: 'Spouse' } });
      fireEvent.change(screen.getByLabelText(/Emergency Contact Phone/i), { target: { value: '555-987-6543' } });
    });
    
    // Proceed to step 5
    fireEvent.click(screen.getByText('Next'));
    
    // Check review page and submit
    await waitFor(() => {
      expect(screen.getByText('Review & Confirmation')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    // Confirm submission in modal
    await waitFor(() => {
      fireEvent.click(screen.getByText('Confirm'));
    });
    
    // Verify that createClient was called with the correct data
    await waitFor(() => {
      expect(secureClientService.createClient).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        phone: '555-123-4567',
        address: expect.objectContaining({
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345'
        }),
        emergencyContactName: 'Jane Doe',
        emergencyContactRelationship: 'Spouse',
        emergencyContactPhone: '555-987-6543'
      }));
    });
  });

  test('handles conditional fields correctly', async () => {
    renderClientForm();
    
    // Fill out required fields in step 1
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });
    
    // Select "Other" for gender to trigger conditional field
    fireEvent.click(screen.getByLabelText(/Other/i));
    
    // Check if the conditional field appears
    await waitFor(() => {
      expect(screen.getByLabelText(/Please specify/i)).toBeInTheDocument();
    });
    
    // Fill the conditional field
    fireEvent.change(screen.getByLabelText(/Please specify/i), { target: { value: 'Non-binary' } });
    
    // Proceed to next step
    fireEvent.click(screen.getByText('Next'));
    
    // Verify we moved to the next step
    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });
  });

  test('saves draft and restores it correctly', async () => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    renderClientForm();
    
    // Fill out some fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    
    // Save draft
    fireEvent.click(screen.getByText('Save Draft'));
    
    // Clear the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: '' } });
    
    // Reload the component
    renderClientForm();
    
    // Check if the draft was restored
    await waitFor(() => {
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
      expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
    });
  });
});
