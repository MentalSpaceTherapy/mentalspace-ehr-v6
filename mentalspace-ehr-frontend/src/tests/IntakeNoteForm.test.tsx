import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocumentationProvider } from '../../contexts/DocumentationContext';
import { AuthProvider } from '../../contexts/AuthContext';
import IntakeNoteForm from '../../pages/documentation/IntakeNoteForm';
import documentationService from '../../services/documentation/documentationService';

// Mock the documentation service
jest.mock('../../services/documentation/documentationService');

describe('IntakeNoteForm Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the createNote function
    documentationService.createNote = jest.fn().mockResolvedValue({
      id: '123',
      clientId: '101',
      providerId: '201',
      noteType: 'INTAKE',
      content: '',
      structuredContent: {},
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Mock the saveDraft function
    documentationService.saveDraft = jest.fn().mockResolvedValue({
      id: '123',
      clientId: '101',
      providerId: '201',
      noteType: 'INTAKE',
      content: '',
      structuredContent: {},
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Mock the finalizeNote function
    documentationService.finalizeNote = jest.fn().mockResolvedValue({
      id: '123',
      clientId: '101',
      providerId: '201',
      noteType: 'INTAKE',
      content: '',
      structuredContent: {},
      status: 'SIGNED',
      signedBy: '201',
      signedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Mock the getNote function for edit mode
    documentationService.getNote = jest.fn().mockResolvedValue({
      id: '123',
      clientId: '101',
      providerId: '201',
      noteType: 'INTAKE',
      content: '',
      structuredContent: {
        clientIdentification: {
          clientName: 'John Doe',
          dateOfBirth: '1990-01-01',
          clientId: '101'
        },
        presentingProblem: {
          chiefComplaint: 'Anxiety',
          historyOfPresentingProblem: 'Ongoing for 6 months'
        }
      },
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Mock recordUserActivity to prevent localStorage errors in tests
    documentationService.recordUserActivity = jest.fn();
    documentationService.checkSessionActivity = jest.fn().mockReturnValue(true);
    documentationService.recoverDraft = jest.fn().mockReturnValue(null);
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

  test('renders intake note form with step 1 initially', async () => {
    renderWithProviders(<IntakeNoteForm />);
    
    // Check if the title is rendered
    expect(screen.getByText('Intake Note')).toBeInTheDocument();
    
    // Check if step 1 is active
    expect(screen.getByText('Client Identification')).toBeInTheDocument();
    
    // Check if the progress indicator shows step 1 of 6
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  test('navigates to next step when next button is clicked', async () => {
    renderWithProviders(<IntakeNoteForm />);
    
    // Fill in required fields in step 1
    fireEvent.change(screen.getByLabelText(/Client Name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    
    fireEvent.change(screen.getByLabelText(/Client ID/i), {
      target: { value: '101' }
    });
    
    // Click the next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check if step 2 is now active
    await waitFor(() => {
      expect(screen.getByText('Presenting Problem')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    });
  });

  test('shows validation errors when required fields are empty', async () => {
    renderWithProviders(<IntakeNoteForm />);
    
    // Click the next button without filling required fields
    fireEvent.click(screen.getByText('Next'));
    
    // Check if validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/Client Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Date of Birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Client ID is required/i)).toBeInTheDocument();
    });
  });

  test('saves draft when save draft button is clicked', async () => {
    renderWithProviders(<IntakeNoteForm />);
    
    // Fill in required fields in step 1
    fireEvent.change(screen.getByLabelText(/Client Name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    
    fireEvent.change(screen.getByLabelText(/Client ID/i), {
      target: { value: '101' }
    });
    
    // Click the save draft button
    fireEvent.click(screen.getByText('Save Draft'));
    
    // Check if saveDraft was called with the correct data
    await waitFor(() => {
      expect(documentationService.saveDraft).toHaveBeenCalled();
      const saveDraftCall = documentationService.saveDraft.mock.calls[0];
      expect(saveDraftCall[1].clientIdentification.clientName).toBe('John Doe');
    });
    
    // Check if success message is shown
    expect(screen.getByText(/Draft saved successfully/i)).toBeInTheDocument();
  });

  test('loads existing note data in edit mode', async () => {
    // Mock useParams to simulate edit mode
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ id: '123' })
    }));
    
    renderWithProviders(<IntakeNoteForm />);
    
    // Check if getNote was called
    await waitFor(() => {
      expect(documentationService.getNote).toHaveBeenCalledWith('123');
    });
    
    // Check if form fields are populated with existing data
    await waitFor(() => {
      expect(screen.getByLabelText(/Client Name/i).value).toBe('John Doe');
      expect(screen.getByLabelText(/Date of Birth/i).value).toBe('1990-01-01');
      expect(screen.getByLabelText(/Client ID/i).value).toBe('101');
    });
  });

  test('completes all steps and finalizes note', async () => {
    renderWithProviders(<IntakeNoteForm />);
    
    // Step 1: Client Identification
    fireEvent.change(screen.getByLabelText(/Client Name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    
    fireEvent.change(screen.getByLabelText(/Client ID/i), {
      target: { value: '101' }
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Presenting Problem
    await waitFor(() => {
      expect(screen.getByText('Presenting Problem')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Chief Complaint/i), {
      target: { value: 'Anxiety' }
    });
    
    fireEvent.change(screen.getByLabelText(/History of Presenting Problem/i), {
      target: { value: 'Ongoing for 6 months' }
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Continue through remaining steps (simplified for test)
    // Step 3: Mental Status Exam
    await waitFor(() => {
      expect(screen.getByText('Mental Status Exam')).toBeInTheDocument();
    });
    
    // Fill required fields and continue
    fireEvent.click(screen.getByText('Next'));
    
    // Step 4: Risk Assessment
    await waitFor(() => {
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });
    
    // Fill required fields and continue
    fireEvent.click(screen.getByText('Next'));
    
    // Step 5: Psychosocial History
    await waitFor(() => {
      expect(screen.getByText('Psychosocial History')).toBeInTheDocument();
    });
    
    // Fill required fields and continue
    fireEvent.click(screen.getByText('Next'));
    
    // Step 6: Diagnosis
    await waitFor(() => {
      expect(screen.getByText('Diagnosis')).toBeInTheDocument();
    });
    
    // Fill required fields and finalize
    fireEvent.click(screen.getByText('Finalize Note'));
    
    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to finalize this note/i)).toBeInTheDocument();
    });
    
    // Confirm finalization
    fireEvent.click(screen.getByText('Yes, Finalize'));
    
    // Check if signature modal appears
    await waitFor(() => {
      expect(screen.getByText(/Please enter your signature/i)).toBeInTheDocument();
    });
    
    // Enter signature
    fireEvent.change(screen.getByLabelText(/Signature/i), {
      target: { value: 'Dr. John Smith' }
    });
    
    // Submit signature
    fireEvent.click(screen.getByText('Sign & Complete'));
    
    // Check if finalizeNote was called
    await waitFor(() => {
      expect(documentationService.finalizeNote).toHaveBeenCalled();
    });
  });
});
