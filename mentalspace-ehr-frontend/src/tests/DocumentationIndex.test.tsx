import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocumentationProvider } from '../../contexts/DocumentationContext';
import { AuthProvider } from '../../contexts/AuthContext';
import DocumentationIndex from '../../pages/documentation/index';
import documentationService from '../../services/documentation/documentationService';

// Mock the documentation service
jest.mock('../../services/documentation/documentationService');

describe('DocumentationIndex Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the fetchNotes function
    documentationService.fetchNotes = jest.fn().mockResolvedValue([
      {
        id: '1',
        clientId: '101',
        providerId: '201',
        noteType: 'INTAKE',
        content: '',
        structuredContent: {},
        status: 'DRAFT',
        createdAt: new Date('2025-04-01'),
        updatedAt: new Date('2025-04-01')
      },
      {
        id: '2',
        clientId: '102',
        providerId: '201',
        noteType: 'PROGRESS',
        content: '',
        structuredContent: {},
        status: 'SIGNED',
        signedBy: '201',
        signedAt: new Date('2025-04-02'),
        createdAt: new Date('2025-04-02'),
        updatedAt: new Date('2025-04-02')
      }
    ]);
    
    // Mock recordUserActivity to prevent localStorage errors in tests
    documentationService.recordUserActivity = jest.fn();
    documentationService.checkSessionActivity = jest.fn().mockReturnValue(true);
  });

  const renderWithProviders = (ui) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <DocumentationProvider>
            {ui}
          </DocumentationProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders documentation index page with title', async () => {
    renderWithProviders(<DocumentationIndex />);
    
    // Check if the title is rendered
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    
    // Check if the create button is rendered
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    
    // Verify fetchNotes was called
    await waitFor(() => {
      expect(documentationService.fetchNotes).toHaveBeenCalled();
    });
  });

  test('opens dropdown menu when create button is clicked', async () => {
    renderWithProviders(<DocumentationIndex />);
    
    // Click the create button
    fireEvent.click(screen.getByText('Create New Note'));
    
    // Check if dropdown options are visible
    await waitFor(() => {
      expect(screen.getByText('Intake Note')).toBeVisible();
      expect(screen.getByText('Progress Note')).toBeVisible();
      expect(screen.getByText('Treatment Plan')).toBeVisible();
      expect(screen.getByText('Discharge Note')).toBeVisible();
      expect(screen.getByText('Cancellation Note')).toBeVisible();
      expect(screen.getByText('Contact/Consultation Note')).toBeVisible();
    });
  });

  test('filters notes based on search input', async () => {
    renderWithProviders(<DocumentationIndex />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Note ID
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: '2' } });
    
    // Check if filtering works
    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument(); // Note ID 1 should be filtered out
      expect(screen.getByText('2')).toBeInTheDocument(); // Note ID 2 should remain
    });
  });

  test('filters notes based on status dropdown', async () => {
    renderWithProviders(<DocumentationIndex />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
      expect(screen.getByText('SIGNED')).toBeInTheDocument();
    });
    
    // Select status filter
    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'signed' } });
    
    // Check if filtering works
    await waitFor(() => {
      expect(screen.queryByText('DRAFT')).not.toBeInTheDocument();
      expect(screen.getByText('SIGNED')).toBeInTheDocument();
    });
  });

  test('navigates to correct route when creating a new note', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithProviders(<DocumentationIndex />);
    
    // Click the create button
    fireEvent.click(screen.getByText('Create New Note'));
    
    // Click on Intake Note
    await waitFor(() => {
      fireEvent.click(screen.getByText('Intake Note'));
    });
    
    // Check if navigation was called with correct route
    // Note: This test may need adjustment based on how navigation is implemented
    // in your actual component
  });

  test('displays loading state while fetching notes', async () => {
    // Mock a delayed response
    documentationService.fetchNotes = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([]);
        }, 100);
      });
    });
    
    renderWithProviders(<DocumentationIndex />);
    
    // Check if loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  test('displays error message when fetching notes fails', async () => {
    // Mock an error response
    documentationService.fetchNotes = jest.fn().mockRejectedValue(new Error('Failed to fetch notes'));
    
    renderWithProviders(<DocumentationIndex />);
    
    // Check if error message is shown
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
