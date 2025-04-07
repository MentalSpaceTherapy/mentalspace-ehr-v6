import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProgressNoteForm } from '../../models/documentation/ProgressNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const ProgressNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // State for form data
  const [formData, setFormData] = useState<ProgressNoteForm>({
    sessionContext: {
      dateTime: '',
      sessionType: 'Individual',
      duration: 50,
    },
    subjective: {
      clientReport: '',
    },
    objective: {
      clinicianObservations: '',
    },
    assessment: {
      clinicianAssessment: '',
      riskLevel: 'Stable',
    },
    plan: {
      interventionsUsed: '',
      nextSteps: 'Schedule Follow-Up',
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Function to handle form field changes
  const handleChange = (section: keyof ProgressNoteForm, field: string, value: any) => {
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
      case 1: // Session Context
        if (!formData.sessionContext.dateTime) {
          newErrors['sessionContext.dateTime'] = 'Date and time are required';
        }
        if (formData.sessionContext.duration <= 0) {
          newErrors['sessionContext.duration'] = 'Duration must be greater than 0';
        }
        break;
        
      case 2: // Subjective
        if (!formData.subjective.clientReport) {
          newErrors['subjective.clientReport'] = 'Client report is required';
        }
        break;
        
      case 3: // Objective
        if (!formData.objective.clinicianObservations) {
          newErrors['objective.clinicianObservations'] = 'Clinician observations are required';
        }
        break;
        
      case 4: // Assessment
        if (!formData.assessment.clinicianAssessment) {
          newErrors['assessment.clinicianAssessment'] = 'Clinician assessment is required';
        }
        break;
        
      case 5: // Plan
        if (!formData.plan.interventionsUsed) {
          newErrors['plan.interventionsUsed'] = 'Interventions used are required';
        }
        if (formData.plan.nextSteps === 'Other' && !formData.plan.nextStepsOther) {
          newErrors['plan.nextStepsOther'] = 'Please specify next steps';
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
        return renderSessionContextStep();
      case 2:
        return renderSubjectiveStep();
      case 3:
        return renderObjectiveStep();
      case 4:
        return renderAssessmentStep();
      case 5:
        return renderPlanStep();
      default:
        return null;
    }
  };
  
  // Step 1: Session Context
  const renderSessionContextStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Session Context</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date/Time of Session <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['sessionContext.dateTime'] ? 'border-red-500' : ''
            }`}
            value={formData.sessionContext.dateTime}
            onChange={(e) => handleChange('sessionContext', 'dateTime', e.target.value)}
          />
          {errors['sessionContext.dateTime'] && (
            <p className="mt-1 text-sm text-red-500">{errors['sessionContext.dateTime']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Session Type <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.sessionContext.sessionType}
            onChange={(e) => handleChange('sessionContext', 'sessionType', e.target.value)}
          >
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
            <option value="Couples">Couples</option>
            <option value="Family">Family</option>
            <option value="Intake">Intake</option>
            <option value="Telehealth">Telehealth</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['sessionContext.duration'] ? 'border-red-500' : ''
            }`}
            value={formData.sessionContext.duration}
            onChange={(e) => handleChange('sessionContext', 'duration', parseInt(e.target.value))}
            min="1"
          />
          {errors['sessionContext.duration'] && (
            <p className="mt-1 text-sm text-red-500">{errors['sessionContext.duration']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 2: Subjective (S) / Data (D)
  const renderSubjectiveStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Subjective (S) / Data (D)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client's Report <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['subjective.clientReport'] ? 'border-red-500' : ''
            }`}
            value={formData.subjective.clientReport}
            onChange={(e) => handleChange('subjective', 'clientReport', e.target.value)}
            placeholder="Document client's self-report, including symptoms, concerns, and progress since last session"
          />
          {errors['subjective.clientReport'] && (
            <p className="mt-1 text-sm text-red-500">{errors['subjective.clientReport']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Anxiety Rating (1-10)
          </label>
          <div className="flex items-center mt-1">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              value={formData.subjective.anxietyRating || 1}
              onChange={(e) => handleChange('subjective', 'anxietyRating', parseInt(e.target.value))}
            />
            <span className="ml-2 text-gray-700">{formData.subjective.anxietyRating || 1}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Depression Rating (1-10)
          </label>
          <div className="flex items-center mt-1">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              value={formData.subjective.depressionRating || 1}
              onChange={(e) => handleChange('subjective', 'depressionRating', parseInt(e.target.value))}
            />
            <span className="ml-2 text-gray-700">{formData.subjective.depressionRating || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step 3: Objective (O)
  const renderObjectiveStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Objective (O)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Clinician's Observations <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['objective.clinicianObservations'] ? 'border-red-500' : ''
            }`}
            value={formData.objective.clinicianObservations}
            onChange={(e) => handleChange('objective', 'clinicianObservations', e.target.value)}
            placeholder="Document observable client behaviors, affect, and presentation during the session"
          />
          {errors['objective.clinicianObservations'] && (
            <p className="mt-1 text-sm text-red-500">{errors['objective.clinicianObservations']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Brief MSE Summary
          </label>
          <textarea
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.objective.mseSummary || ''}
            onChange={(e) => handleChange('objective', 'mseSummary', e.target.value)}
            placeholder="Optional brief mental status examination summary"
          />
        </div>
      </div>
    </div>
  );
  
  // Step 4: Assessment (A)
  const renderAssessmentStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Assessment (A)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Clinician's Assessment <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['assessment.clinicianAssessment'] ? 'border-red-500' : ''
            }`}
            value={formData.assessment.clinicianAssessment}
            onChange={(e) => handleChange('assessment', 'clinicianAssessment', e.target.value)}
            placeholder="Document your clinical assessment of the client's current status, progress, and treatment needs"
          />
          {errors['assessment.clinicianAssessment'] && (
            <p className="mt-1 text-sm text-red-500">{errors['assessment.clinicianAssessment']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Risk Level Update <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.assessment.riskLevel}
            onChange={(e) => handleChange('assessment', 'riskLevel', e.target.value)}
          >
            <option value="Stable">Stable</option>
            <option value="Elevated">Elevated</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  // Step 5: Plan (P)
  const renderPlanStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Plan (P)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interventions Used <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['plan.interventionsUsed'] ? 'border-red-500' : ''
            }`}
            value={formData.plan.interventionsUsed}
            onChange={(e) => handleChange('plan', 'interventionsUsed', e.target.value)}
            placeholder="Document therapeutic interventions used during this session"
          />
          {errors['plan.interventionsUsed'] && (
            <p className="mt-1 text-sm text-red-500">{errors['plan.interventionsUsed']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Homework Assigned
          </label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.plan.homeworkAssigned || ''}
            onChange={(e) => handleChange('plan', 'homeworkAssigned', e.target.value)}
            placeholder="Optional homework or assignments for client to complete before next session"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Next Steps <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.plan.nextSteps}
            onChange={(e) => handleChange('plan', 'nextSteps', e.target.value)}
          >
            <option value="Schedule Follow-Up">Schedule Follow-Up</option>
            <option value="Referral">Referral</option>
            <option value="No Change">No Change</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.plan.nextSteps === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specify Next Steps <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['plan.nextStepsOther'] ? 'border-red-500' : ''
              }`}
              value={formData.plan.nextStepsOther || ''}
              onChange={(e) => handleChange('plan', 'nextStepsOther', e.target.value)}
            />
            {errors['plan.nextStepsOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['plan.nextStepsOther']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Confirmation Modal
  const renderConfirmationModal = () => (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 ${showConfirmModal ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Note Finalization</h3>
        <p className="text-gray-500 mb-6">
          All sections of the Progress Note are complete. Are you ready to sign and lock this note?
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
        <h1 className="text-2xl font-bold">Progress Note</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing progress note' : 'Create a new progress note'}
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
          <div className="text-xs">Session Context</div>
          <div className="text-xs">Subjective</div>
          <div className="text-xs">Objective</div>
          <div className="text-xs">Assessment</div>
          <div className="text-xs">Plan</div>
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

export default ProgressNoteFormComponent;
