import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CancellationNoteForm } from '../../models/documentation/CancellationNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const CancellationNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // State for form data
  const [formData, setFormData] = useState<CancellationNoteForm>({
    appointmentDetails: {
      scheduledDateTime: '',
      clientName: '',
      sessionType: '',
    },
    cancellationReason: {
      reason: 'Client Canceled',
    },
    followUpActions: {
      rescheduled: false,
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Function to handle form field changes
  const handleChange = (section: keyof CancellationNoteForm, field: string, value: any) => {
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
  
  // Function to validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Appointment Details
        if (!formData.appointmentDetails.scheduledDateTime) {
          newErrors['appointmentDetails.scheduledDateTime'] = 'Scheduled date/time is required';
        }
        if (!formData.appointmentDetails.clientName) {
          newErrors['appointmentDetails.clientName'] = 'Client name is required';
        }
        if (!formData.appointmentDetails.sessionType) {
          newErrors['appointmentDetails.sessionType'] = 'Session type is required';
        }
        break;
        
      case 2: // Reason for Cancellation/No-Show
        if (formData.cancellationReason.reason === 'Other' && !formData.cancellationReason.otherReason) {
          newErrors['cancellationReason.otherReason'] = 'Please specify the reason';
        }
        break;
        
      case 3: // Follow-Up Actions
        if (formData.followUpActions.rescheduled && !formData.followUpActions.rescheduleDateTime) {
          newErrors['followUpActions.rescheduleDateTime'] = 'Reschedule date/time is required';
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
        return renderAppointmentDetailsStep();
      case 2:
        return renderCancellationReasonStep();
      case 3:
        return renderFollowUpActionsStep();
      default:
        return null;
    }
  };
  
  // Step 1: Appointment Details
  const renderAppointmentDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Appointment Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Scheduled Appointment Date/Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['appointmentDetails.scheduledDateTime'] ? 'border-red-500' : ''
            }`}
            value={formData.appointmentDetails.scheduledDateTime}
            onChange={(e) => handleChange('appointmentDetails', 'scheduledDateTime', e.target.value)}
          />
          {errors['appointmentDetails.scheduledDateTime'] && (
            <p className="mt-1 text-sm text-red-500">{errors['appointmentDetails.scheduledDateTime']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['appointmentDetails.clientName'] ? 'border-red-500' : ''
            }`}
            value={formData.appointmentDetails.clientName}
            onChange={(e) => handleChange('appointmentDetails', 'clientName', e.target.value)}
          />
          {errors['appointmentDetails.clientName'] && (
            <p className="mt-1 text-sm text-red-500">{errors['appointmentDetails.clientName']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Session Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['appointmentDetails.sessionType'] ? 'border-red-500' : ''
            }`}
            value={formData.appointmentDetails.sessionType}
            onChange={(e) => handleChange('appointmentDetails', 'sessionType', e.target.value)}
          />
          {errors['appointmentDetails.sessionType'] && (
            <p className="mt-1 text-sm text-red-500">{errors['appointmentDetails.sessionType']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 2: Reason for Cancellation/No-Show
  const renderCancellationReasonStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reason for Cancellation/No-Show</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.cancellationReason.reason}
            onChange={(e) => handleChange('cancellationReason', 'reason', e.target.value)}
          >
            <option value="Client Canceled">Client Canceled</option>
            <option value="Provider Canceled">Provider Canceled</option>
            <option value="No-Show">No-Show</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.cancellationReason.reason === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please specify reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['cancellationReason.otherReason'] ? 'border-red-500' : ''
              }`}
              value={formData.cancellationReason.otherReason || ''}
              onChange={(e) => handleChange('cancellationReason', 'otherReason', e.target.value)}
            />
            {errors['cancellationReason.otherReason'] && (
              <p className="mt-1 text-sm text-red-500">{errors['cancellationReason.otherReason']}</p>
            )}
          </div>
        )}
        
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            Additional notes about the cancellation or no-show:
          </p>
          <textarea
            rows={3}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Optional additional details about the cancellation"
          />
        </div>
      </div>
    </div>
  );
  
  // Step 3: Follow-Up Actions
  const renderFollowUpActionsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Follow-Up Actions</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Rescheduled
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.followUpActions.rescheduled}
              onChange={(e) => handleChange('followUpActions', 'rescheduled', e.target.checked)}
            />
            <span className="ml-2 text-gray-700">Appointment has been rescheduled</span>
          </div>
        </div>
        
        {formData.followUpActions.rescheduled && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reschedule Date/Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['followUpActions.rescheduleDateTime'] ? 'border-red-500' : ''
              }`}
              value={formData.followUpActions.rescheduleDateTime || ''}
              onChange={(e) => handleChange('followUpActions', 'rescheduleDateTime', e.target.value)}
            />
            {errors['followUpActions.rescheduleDateTime'] && (
              <p className="mt-1 text-sm text-red-500">{errors['followUpActions.rescheduleDateTime']}</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Follow-Up Required
          </label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.followUpActions.followUpRequired || ''}
            onChange={(e) => handleChange('followUpActions', 'followUpRequired', e.target.value)}
            placeholder="Describe any follow-up actions required (e.g., phone call, email)"
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
          Confirm and lock this Cancellation Note.
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
        <h1 className="text-2xl font-bold">Cancellation/Missed Appointment Note</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing cancellation note' : 'Create a new cancellation note'}
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
          <div className="text-xs">Appointment Details</div>
          <div className="text-xs">Cancellation Reason</div>
          <div className="text-xs">Follow-Up Actions</div>
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

export default CancellationNoteFormComponent;
