import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactNoteForm } from '../../models/documentation/ContactNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const ContactNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // State for form data
  const [formData, setFormData] = useState<ContactNoteForm>({
    contactDetails: {
      dateTime: '',
      contactType: 'Phone',
      participants: [],
    },
    interactionSummary: {
      detailedSummary: '',
    },
    outcomeAndNextSteps: {
      outcome: 'Follow-Up Scheduled',
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Mock data for participants selection
  const mockParticipants = [
    { id: '1', name: 'Dr. Jane Smith', type: 'Staff' },
    { id: '2', name: 'Dr. John Doe', type: 'Staff' },
    { id: '3', name: 'Sarah Johnson', type: 'Client' },
    { id: '4', name: 'Michael Brown', type: 'Client' },
    { id: '5', name: 'Dr. Robert Wilson', type: 'External' },
  ];
  
  // Function to handle form field changes
  const handleChange = (section: keyof ContactNoteForm, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };
  
  // Function to handle participant selection
  const handleParticipantChange = (participantId: string) => {
    setFormData(prev => {
      const currentParticipants = [...prev.contactDetails.participants];
      
      if (currentParticipants.includes(participantId)) {
        // Remove participant if already selected
        const updatedParticipants = currentParticipants.filter(id => id !== participantId);
        return {
          ...prev,
          contactDetails: {
            ...prev.contactDetails,
            participants: updatedParticipants
          }
        };
      } else {
        // Add participant if not already selected
        return {
          ...prev,
          contactDetails: {
            ...prev.contactDetails,
            participants: [...currentParticipants, participantId]
          }
        };
      }
    });
    
    // Clear error if it exists
    if (errors['contactDetails.participants']) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['contactDetails.participants'];
        return newErrors;
      });
    }
  };
  
  // Function to validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Contact Details
        if (!formData.contactDetails.dateTime) {
          newErrors['contactDetails.dateTime'] = 'Date and time are required';
        }
        if (formData.contactDetails.participants.length === 0) {
          newErrors['contactDetails.participants'] = 'At least one participant is required';
        }
        break;
        
      case 2: // Interaction Summary
        if (!formData.interactionSummary.detailedSummary) {
          newErrors['interactionSummary.detailedSummary'] = 'Detailed summary is required';
        }
        break;
        
      case 3: // Outcome & Next Steps
        if (formData.outcomeAndNextSteps.outcome === 'Other' && !formData.outcomeAndNextSteps.outcomeOther) {
          newErrors['outcomeAndNextSteps.outcomeOther'] = 'Please specify the outcome';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        // If on the last step, show confirmation modal
        setShowConfirmModal(true);
      }
    }
  };
  
  // Function to handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Function to save draft
  const handleSaveDraft = async () => {
    try {
      // Mock API call - would be replaced with actual API call
      console.log('Saving draft:', formData);
      alert('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft');
    }
  };
  
  // Function to finalize and sign the note
  const handleFinalizeNote = async () => {
    try {
      // Mock API call - would be replaced with actual API call
      console.log('Finalizing note:', formData);
      alert('Note finalized and signed successfully');
      navigate('/documentation');
    } catch (error) {
      console.error('Error finalizing note:', error);
      alert('Error finalizing note');
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderContactDetailsStep();
      case 2:
        return renderInteractionSummaryStep();
      case 3:
        return renderOutcomeAndNextStepsStep();
      default:
        return null;
    }
  };
  
  // Step 1: Contact Details
  const renderContactDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contact Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date and Time of Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['contactDetails.dateTime'] ? 'border-red-500' : ''
            }`}
            value={formData.contactDetails.dateTime}
            onChange={(e) => handleChange('contactDetails', 'dateTime', e.target.value)}
          />
          {errors['contactDetails.dateTime'] && (
            <p className="mt-1 text-sm text-red-500">{errors['contactDetails.dateTime']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Type <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.contactDetails.contactType}
            onChange={(e) => handleChange('contactDetails', 'contactType', e.target.value)}
          >
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
            <option value="In-Person">In-Person</option>
            <option value="External Consultation">External Consultation</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Participants <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md">
            {mockParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`participant-${participant.id}`}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.contactDetails.participants.includes(participant.id)}
                  onChange={() => handleParticipantChange(participant.id)}
                />
                <label htmlFor={`participant-${participant.id}`} className="ml-2 block text-sm text-gray-900">
                  {participant.name} <span className="text-xs text-gray-500">({participant.type})</span>
                </label>
              </div>
            ))}
          </div>
          {errors['contactDetails.participants'] && (
            <p className="mt-1 text-sm text-red-500">{errors['contactDetails.participants']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 2: Interaction Summary
  const renderInteractionSummaryStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Interaction Summary</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detailed Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['interactionSummary.detailedSummary'] ? 'border-red-500' : ''
            }`}
            value={formData.interactionSummary.detailedSummary}
            onChange={(e) => handleChange('interactionSummary', 'detailedSummary', e.target.value)}
            placeholder="Provide a detailed summary of the interaction, including key points discussed, information shared, and any decisions made"
          />
          {errors['interactionSummary.detailedSummary'] && (
            <p className="mt-1 text-sm text-red-500">{errors['interactionSummary.detailedSummary']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 3: Outcome & Next Steps
  const renderOutcomeAndNextStepsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Outcome & Next Steps</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Outcome <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.outcomeAndNextSteps.outcome}
            onChange={(e) => handleChange('outcomeAndNextSteps', 'outcome', e.target.value)}
          >
            <option value="Follow-Up Scheduled">Follow-Up Scheduled</option>
            <option value="No Further Action">No Further Action</option>
            <option value="Referral Provided">Referral Provided</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.outcomeAndNextSteps.outcome === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specify Outcome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['outcomeAndNextSteps.outcomeOther'] ? 'border-red-500' : ''
              }`}
              value={formData.outcomeAndNextSteps.outcomeOther || ''}
              onChange={(e) => handleChange('outcomeAndNextSteps', 'outcomeOther', e.target.value)}
            />
            {errors['outcomeAndNextSteps.outcomeOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['outcomeAndNextSteps.outcomeOther']}</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Next Steps
          </label>
          <textarea
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.outcomeAndNextSteps.nextSteps || ''}
            onChange={(e) => handleChange('outcomeAndNextSteps', 'nextSteps', e.target.value)}
            placeholder="Describe any next steps, follow-up actions, or recommendations"
          />
        </div>
      </div>
    </div>
  );
  
  // Confirmation Modal
  const renderConfirmationModal = () => (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 ${showConfirmModal ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Note Finalization</h3>
        <p className="text-gray-500 mb-6">
          Finalize and sign this Contact/Consultation Note.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleFinalizeNote}
          >
            Confirm and Sign
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contact/Consultation Note</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing contact note' : 'Create a new contact note'}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center ${index > 0 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 === currentStep
                    ? 'bg-blue-600 text-white'
                    : index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1 < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-xs">Contact Details</div>
          <div className="text-xs">Interaction Summary</div>
          <div className="text-xs">Outcome & Next Steps</div>
        </div>
      </div>
      
      {/* Form content */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>
      
      {/* Form navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={handlePrevStep}
            >
              Previous
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleNextStep}
          >
            {currentStep < totalSteps ? 'Next' : 'Finalize and Sign'}
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {renderConfirmationModal()}
    </div>
  );
};

export default ContactNoteFormComponent;
