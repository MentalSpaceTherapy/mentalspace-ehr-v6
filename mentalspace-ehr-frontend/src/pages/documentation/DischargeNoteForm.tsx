import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DischargeNoteForm } from '../../models/documentation/DischargeNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const DischargeNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // State for form data
  const [formData, setFormData] = useState<DischargeNoteForm>({
    dischargeContext: {
      dischargeDate: '',
      reasonForDischarge: 'Treatment Completed',
    },
    treatmentSummary: {
      overviewOfTreatment: '',
      keyInterventionsAndProgress: '',
    },
    diagnosisAndStatus: {
      finalDiagnosis: '',
      clientCurrentStatus: '',
    },
    aftercareAndReferrals: {
      recommendationsForFollowUp: '',
      referralsAndCommunityResources: '',
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Function to handle form field changes
  const handleChange = (section: keyof DischargeNoteForm, field: string, value: any) => {
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
      case 1: // Discharge Context
        if (!formData.dischargeContext.dischargeDate) {
          newErrors['dischargeContext.dischargeDate'] = 'Discharge date is required';
        }
        if (formData.dischargeContext.reasonForDischarge === 'Other' && !formData.dischargeContext.otherDischargeReason) {
          newErrors['dischargeContext.otherDischargeReason'] = 'Please specify the reason for discharge';
        }
        break;
        
      case 2: // Course of Treatment Summary
        if (!formData.treatmentSummary.overviewOfTreatment) {
          newErrors['treatmentSummary.overviewOfTreatment'] = 'Overview of treatment is required';
        }
        if (!formData.treatmentSummary.keyInterventionsAndProgress) {
          newErrors['treatmentSummary.keyInterventionsAndProgress'] = 'Key interventions and progress are required';
        }
        break;
        
      case 3: // Final Diagnosis & Current Status
        if (!formData.diagnosisAndStatus.finalDiagnosis) {
          newErrors['diagnosisAndStatus.finalDiagnosis'] = 'Final diagnosis is required';
        }
        if (formData.diagnosisAndStatus.finalDiagnosis === 'Other' && !formData.diagnosisAndStatus.otherDiagnosis) {
          newErrors['diagnosisAndStatus.otherDiagnosis'] = 'Please specify the diagnosis';
        }
        if (!formData.diagnosisAndStatus.clientCurrentStatus) {
          newErrors['diagnosisAndStatus.clientCurrentStatus'] = 'Client current status is required';
        }
        break;
        
      case 4: // Aftercare & Referrals
        if (!formData.aftercareAndReferrals.recommendationsForFollowUp) {
          newErrors['aftercareAndReferrals.recommendationsForFollowUp'] = 'Recommendations for follow-up care are required';
        }
        if (!formData.aftercareAndReferrals.referralsAndCommunityResources) {
          newErrors['aftercareAndReferrals.referralsAndCommunityResources'] = 'Referrals and community resources are required';
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
        return renderDischargeContextStep();
      case 2:
        return renderTreatmentSummaryStep();
      case 3:
        return renderDiagnosisAndStatusStep();
      case 4:
        return renderAftercareAndReferralsStep();
      default:
        return null;
    }
  };
  
  // Step 1: Discharge Context
  const renderDischargeContextStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Discharge Context</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Discharge Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['dischargeContext.dischargeDate'] ? 'border-red-500' : ''
            }`}
            value={formData.dischargeContext.dischargeDate}
            onChange={(e) => handleChange('dischargeContext', 'dischargeDate', e.target.value)}
          />
          {errors['dischargeContext.dischargeDate'] && (
            <p className="mt-1 text-sm text-red-500">{errors['dischargeContext.dischargeDate']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Discharge <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.dischargeContext.reasonForDischarge}
            onChange={(e) => handleChange('dischargeContext', 'reasonForDischarge', e.target.value)}
          >
            <option value="Treatment Completed">Treatment Completed</option>
            <option value="Client Dropout">Client Dropout</option>
            <option value="Referral to Higher Care">Referral to Higher Care</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.dischargeContext.reasonForDischarge === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please specify reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['dischargeContext.otherDischargeReason'] ? 'border-red-500' : ''
              }`}
              value={formData.dischargeContext.otherDischargeReason || ''}
              onChange={(e) => handleChange('dischargeContext', 'otherDischargeReason', e.target.value)}
            />
            {errors['dischargeContext.otherDischargeReason'] && (
              <p className="mt-1 text-sm text-red-500">{errors['dischargeContext.otherDischargeReason']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Step 2: Course of Treatment Summary
  const renderTreatmentSummaryStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Course of Treatment Summary</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Overview of Treatment <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['treatmentSummary.overviewOfTreatment'] ? 'border-red-500' : ''
            }`}
            value={formData.treatmentSummary.overviewOfTreatment}
            onChange={(e) => handleChange('treatmentSummary', 'overviewOfTreatment', e.target.value)}
            placeholder="Provide a comprehensive overview of the treatment course, including initial presentation, treatment goals, and duration"
          />
          {errors['treatmentSummary.overviewOfTreatment'] && (
            <p className="mt-1 text-sm text-red-500">{errors['treatmentSummary.overviewOfTreatment']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Key Interventions & Progress <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['treatmentSummary.keyInterventionsAndProgress'] ? 'border-red-500' : ''
            }`}
            value={formData.treatmentSummary.keyInterventionsAndProgress}
            onChange={(e) => handleChange('treatmentSummary', 'keyInterventionsAndProgress', e.target.value)}
            placeholder="Describe the key therapeutic interventions used and the client's progress throughout treatment"
          />
          {errors['treatmentSummary.keyInterventionsAndProgress'] && (
            <p className="mt-1 text-sm text-red-500">{errors['treatmentSummary.keyInterventionsAndProgress']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 3: Final Diagnosis & Current Status
  const renderDiagnosisAndStatusStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Final Diagnosis & Current Status</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Final Diagnosis <span className="text-red-500">*</span>
          </label>
          <select
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['diagnosisAndStatus.finalDiagnosis'] ? 'border-red-500' : ''
            }`}
            value={formData.diagnosisAndStatus.finalDiagnosis}
            onChange={(e) => handleChange('diagnosisAndStatus', 'finalDiagnosis', e.target.value)}
          >
            <option value="">Select a diagnosis</option>
            <option value="F32.1">F32.1 - Major Depressive Disorder, Moderate</option>
            <option value="F41.1">F41.1 - Generalized Anxiety Disorder</option>
            <option value="F43.10">F43.10 - Post-Traumatic Stress Disorder</option>
            <option value="F60.3">F60.3 - Borderline Personality Disorder</option>
            <option value="F90.0">F90.0 - Attention-Deficit Hyperactivity Disorder</option>
            <option value="F42">F42 - Obsessive-Compulsive Disorder</option>
            <option value="F31.9">F31.9 - Bipolar Disorder, Unspecified</option>
            <option value="F20.9">F20.9 - Schizophrenia</option>
            <option value="F50.0">F50.0 - Anorexia Nervosa</option>
            <option value="F50.2">F50.2 - Bulimia Nervosa</option>
            <option value="Other">Other</option>
          </select>
          {errors['diagnosisAndStatus.finalDiagnosis'] && (
            <p className="mt-1 text-sm text-red-500">{errors['diagnosisAndStatus.finalDiagnosis']}</p>
          )}
        </div>
        
        {formData.diagnosisAndStatus.finalDiagnosis === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Other Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['diagnosisAndStatus.otherDiagnosis'] ? 'border-red-500' : ''
              }`}
              value={formData.diagnosisAndStatus.otherDiagnosis || ''}
              onChange={(e) => handleChange('diagnosisAndStatus', 'otherDiagnosis', e.target.value)}
              placeholder="Enter diagnosis code and description"
            />
            {errors['diagnosisAndStatus.otherDiagnosis'] && (
              <p className="mt-1 text-sm text-red-500">{errors['diagnosisAndStatus.otherDiagnosis']}</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client's Current Status <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['diagnosisAndStatus.clientCurrentStatus'] ? 'border-red-500' : ''
            }`}
            value={formData.diagnosisAndStatus.clientCurrentStatus}
            onChange={(e) => handleChange('diagnosisAndStatus', 'clientCurrentStatus', e.target.value)}
            placeholder="Describe the client's current mental health status, symptom severity, and functional level at discharge"
          />
          {errors['diagnosisAndStatus.clientCurrentStatus'] && (
            <p className="mt-1 text-sm text-red-500">{errors['diagnosisAndStatus.clientCurrentStatus']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 4: Aftercare & Referrals
  const renderAftercareAndReferralsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Aftercare & Referrals</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recommendations for Follow-Up Care <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['aftercareAndReferrals.recommendationsForFollowUp'] ? 'border-red-500' : ''
            }`}
            value={formData.aftercareAndReferrals.recommendationsForFollowUp}
            onChange={(e) => handleChange('aftercareAndReferrals', 'recommendationsForFollowUp', e.target.value)}
            placeholder="Provide detailed recommendations for ongoing care, including frequency, type of services, and self-care strategies"
          />
          {errors['aftercareAndReferrals.recommendationsForFollowUp'] && (
            <p className="mt-1 text-sm text-red-500">{errors['aftercareAndReferrals.recommendationsForFollowUp']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Referrals/Community Resources <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['aftercareAndReferrals.referralsAndCommunityResources'] ? 'border-red-500' : ''
            }`}
            value={formData.aftercareAndReferrals.referralsAndCommunityResources}
            onChange={(e) => handleChange('aftercareAndReferrals', 'referralsAndCommunityResources', e.target.value)}
            placeholder="List specific referrals made and community resources provided to the client"
          />
          {errors['aftercareAndReferrals.referralsAndCommunityResources'] && (
            <p className="mt-1 text-sm text-red-500">{errors['aftercareAndReferrals.referralsAndCommunityResources']}</p>
          )}
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
          Are you ready to finalize and sign this Discharge Note? Once signed, no further changes can be made.
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
        <h1 className="text-2xl font-bold">Discharge Note</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing discharge note' : 'Create a new discharge note'}
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
          <div className="text-xs">Discharge Context</div>
          <div className="text-xs">Treatment Summary</div>
          <div className="text-xs">Diagnosis & Status</div>
          <div className="text-xs">Aftercare & Referrals</div>
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

export default DischargeNoteFormComponent;
