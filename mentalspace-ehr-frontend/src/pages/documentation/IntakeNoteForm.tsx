import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IntakeNoteForm } from '../../models/documentation/IntakeNoteForm';
import { NoteStatus } from '../../models/documentation/Note';

// Component for the multi-step wizard form
const IntakeNoteFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  // State for form data
  const [formData, setFormData] = useState<IntakeNoteForm>({
    clientIdentification: {
      clientName: '',
      dateOfBirth: '',
      referralSource: 'Website',
    },
    presentingProblem: {
      problem: '',
      onsetDate: '',
      frequency: 'Daily',
      severity: 'Moderate',
      previousTreatment: false,
    },
    mentalStatusExam: {
      appearance: 'Well-Groomed',
      behavior: 'Calm/Cooperative',
      moodAffect: 'Euthymic (Normal)',
      speech: 'Normal Rate/Volume',
      thoughtProcess: 'Linear/Goal-Directed',
      thoughtContent: 'Normal',
      perceptions: 'None',
      orientation: 'Fully Oriented',
    },
    riskAssessment: {
      suicidalIdeation: 'None',
      homicidalIdeation: 'None',
      selfHarmHistory: false,
    },
    psychosocialMedicalHistory: {
      familyMentalHealthHistory: [],
      substanceUseHistory: 'None',
      medicalConditions: '',
      socialSupport: '',
      legalIssues: false,
    },
    diagnosisRecommendations: {
      initialDiagnosis: '',
      clinicalImpression: '',
      treatmentRecommendations: '',
    },
  });
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for showing confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Function to handle form field changes
  const handleChange = (section: keyof IntakeNoteForm, field: string, value: any) => {
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
      case 1: // Client Identification & Referral
        if (!formData.clientIdentification.clientName) {
          newErrors['clientIdentification.clientName'] = 'Client name is required';
        }
        if (!formData.clientIdentification.dateOfBirth) {
          newErrors['clientIdentification.dateOfBirth'] = 'Date of birth is required';
        }
        if (formData.clientIdentification.referralSource === 'Other' && !formData.clientIdentification.otherReferralSource) {
          newErrors['clientIdentification.otherReferralSource'] = 'Please specify the referral source';
        }
        break;
        
      case 2: // Presenting Problem & History
        if (!formData.presentingProblem.problem) {
          newErrors['presentingProblem.problem'] = 'Presenting problem is required';
        }
        if (!formData.presentingProblem.onsetDate) {
          newErrors['presentingProblem.onsetDate'] = 'Onset date is required';
        }
        if (formData.presentingProblem.previousTreatment && !formData.presentingProblem.treatmentDescription) {
          newErrors['presentingProblem.treatmentDescription'] = 'Treatment description is required';
        }
        break;
        
      case 3: // Mental Status Examination
        if (formData.mentalStatusExam.appearance === 'Other' && !formData.mentalStatusExam.appearanceOther) {
          newErrors['mentalStatusExam.appearanceOther'] = 'Please describe appearance';
        }
        if (formData.mentalStatusExam.behavior === 'Other' && !formData.mentalStatusExam.behaviorOther) {
          newErrors['mentalStatusExam.behaviorOther'] = 'Please describe behavior';
        }
        if (formData.mentalStatusExam.moodAffect === 'Other' && !formData.mentalStatusExam.moodAffectOther) {
          newErrors['mentalStatusExam.moodAffectOther'] = 'Please describe mood/affect';
        }
        if (formData.mentalStatusExam.speech === 'Other' && !formData.mentalStatusExam.speechOther) {
          newErrors['mentalStatusExam.speechOther'] = 'Please describe speech';
        }
        if (formData.mentalStatusExam.thoughtProcess === 'Other' && !formData.mentalStatusExam.thoughtProcessOther) {
          newErrors['mentalStatusExam.thoughtProcessOther'] = 'Please describe thought process';
        }
        if (formData.mentalStatusExam.thoughtContent === 'Other' && !formData.mentalStatusExam.thoughtContentOther) {
          newErrors['mentalStatusExam.thoughtContentOther'] = 'Please describe thought content';
        }
        if (formData.mentalStatusExam.perceptions === 'Other' && !formData.mentalStatusExam.perceptionsOther) {
          newErrors['mentalStatusExam.perceptionsOther'] = 'Please describe perceptions';
        }
        break;
        
      case 4: // Risk Assessment
        if (formData.riskAssessment.selfHarmHistory && !formData.riskAssessment.selfHarmDescription) {
          newErrors['riskAssessment.selfHarmDescription'] = 'Self-harm history description is required';
        }
        const hasRisk = formData.riskAssessment.suicidalIdeation !== 'None' || 
                        formData.riskAssessment.homicidalIdeation !== 'None';
        if (hasRisk && !formData.riskAssessment.safetyPlan) {
          newErrors['riskAssessment.safetyPlan'] = 'Safety plan is required when risk is present';
        }
        break;
        
      case 5: // Psychosocial & Medical History
        if (!formData.psychosocialMedicalHistory.medicalConditions) {
          newErrors['psychosocialMedicalHistory.medicalConditions'] = 'Medical conditions field is required';
        }
        if (!formData.psychosocialMedicalHistory.socialSupport) {
          newErrors['psychosocialMedicalHistory.socialSupport'] = 'Social support field is required';
        }
        if (formData.psychosocialMedicalHistory.legalIssues && !formData.psychosocialMedicalHistory.legalIssuesDescription) {
          newErrors['psychosocialMedicalHistory.legalIssuesDescription'] = 'Legal issues description is required';
        }
        if (formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Other') && 
            !formData.psychosocialMedicalHistory.otherFamilyHistory) {
          newErrors['psychosocialMedicalHistory.otherFamilyHistory'] = 'Please describe other family history';
        }
        break;
        
      case 6: // Diagnosis & Recommendations
        if (!formData.diagnosisRecommendations.initialDiagnosis) {
          newErrors['diagnosisRecommendations.initialDiagnosis'] = 'Initial diagnosis is required';
        }
        if (!formData.diagnosisRecommendations.clinicalImpression) {
          newErrors['diagnosisRecommendations.clinicalImpression'] = 'Clinical impression is required';
        }
        if (!formData.diagnosisRecommendations.treatmentRecommendations) {
          newErrors['diagnosisRecommendations.treatmentRecommendations'] = 'Treatment recommendations are required';
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
        return renderClientIdentificationStep();
      case 2:
        return renderPresentingProblemStep();
      case 3:
        return renderMentalStatusExamStep();
      case 4:
        return renderRiskAssessmentStep();
      case 5:
        return renderPsychosocialMedicalHistoryStep();
      case 6:
        return renderDiagnosisRecommendationsStep();
      default:
        return null;
    }
  };
  
  // Step 1: Client Identification & Referral
  const renderClientIdentificationStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Client Identification & Referral</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['clientIdentification.clientName'] ? 'border-red-500' : ''
            }`}
            value={formData.clientIdentification.clientName}
            onChange={(e) => handleChange('clientIdentification', 'clientName', e.target.value)}
          />
          {errors['clientIdentification.clientName'] && (
            <p className="mt-1 text-sm text-red-500">{errors['clientIdentification.clientName']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['clientIdentification.dateOfBirth'] ? 'border-red-500' : ''
            }`}
            value={formData.clientIdentification.dateOfBirth}
            onChange={(e) => handleChange('clientIdentification', 'dateOfBirth', e.target.value)}
          />
          {errors['clientIdentification.dateOfBirth'] && (
            <p className="mt-1 text-sm text-red-500">{errors['clientIdentification.dateOfBirth']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Referral Source <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.clientIdentification.referralSource}
            onChange={(e) => handleChange('clientIdentification', 'referralSource', e.target.value)}
          >
            <option value="Website">Website</option>
            <option value="Physician/Referral Office">Physician/Referral Office</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Social Media">Social Media</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.clientIdentification.referralSource === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please specify referral source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['clientIdentification.otherReferralSource'] ? 'border-red-500' : ''
              }`}
              value={formData.clientIdentification.otherReferralSource || ''}
              onChange={(e) => handleChange('clientIdentification', 'otherReferralSource', e.target.value)}
            />
            {errors['clientIdentification.otherReferralSource'] && (
              <p className="mt-1 text-sm text-red-500">{errors['clientIdentification.otherReferralSource']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Step 2: Presenting Problem & History of Present Illness
  const renderPresentingProblemStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Presenting Problem & History of Present Illness</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Presenting Problem <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['presentingProblem.problem'] ? 'border-red-500' : ''
            }`}
            value={formData.presentingProblem.problem}
            onChange={(e) => handleChange('presentingProblem', 'problem', e.target.value)}
          />
          {errors['presentingProblem.problem'] && (
            <p className="mt-1 text-sm text-red-500">{errors['presentingProblem.problem']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Onset Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['presentingProblem.onsetDate'] ? 'border-red-500' : ''
            }`}
            value={formData.presentingProblem.onsetDate}
            onChange={(e) => handleChange('presentingProblem', 'onsetDate', e.target.value)}
          />
          {errors['presentingProblem.onsetDate'] && (
            <p className="mt-1 text-sm text-red-500">{errors['presentingProblem.onsetDate']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequency <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.presentingProblem.frequency}
            onChange={(e) => handleChange('presentingProblem', 'frequency', e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Several times a week">Several times a week</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Severity <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.presentingProblem.severity}
            onChange={(e) => handleChange('presentingProblem', 'severity', e.target.value)}
          >
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Previous Treatment <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.presentingProblem.previousTreatment === true}
                onChange={() => handleChange('presentingProblem', 'previousTreatment', true)}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.presentingProblem.previousTreatment === false}
                onChange={() => handleChange('presentingProblem', 'previousTreatment', false)}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
        
        {formData.presentingProblem.previousTreatment && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Treatment Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors['presentingProblem.treatmentDescription'] ? 'border-red-500' : ''
                }`}
                value={formData.presentingProblem.treatmentDescription || ''}
                onChange={(e) => handleChange('presentingProblem', 'treatmentDescription', e.target.value)}
              />
              {errors['presentingProblem.treatmentDescription'] && (
                <p className="mt-1 text-sm text-red-500">{errors['presentingProblem.treatmentDescription']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration of Previous Treatment <span className="text-red-500">*</span>
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.presentingProblem.treatmentDuration || ''}
                onChange={(e) => handleChange('presentingProblem', 'treatmentDuration', e.target.value)}
              >
                <option value="">Select duration</option>
                <option value="Less than 6 months">Less than 6 months</option>
                <option value="6–12 months">6–12 months</option>
                <option value="Over 1 year">Over 1 year</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  // Step 3: Mental Status Examination
  const renderMentalStatusExamStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Mental Status Examination (MSE)</h2>
      
      <div className="space-y-4">
        {/* Appearance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Appearance <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.appearance}
            onChange={(e) => handleChange('mentalStatusExam', 'appearance', e.target.value)}
          >
            <option value="Well-Groomed">Well-Groomed</option>
            <option value="Casual">Casual</option>
            <option value="Disheveled">Disheveled</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.appearance === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Appearance <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.appearanceOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.appearanceOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'appearanceOther', e.target.value)}
            />
            {errors['mentalStatusExam.appearanceOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.appearanceOther']}</p>
            )}
          </div>
        )}
        
        {/* Behavior/Psychomotor Activity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Behavior/Psychomotor Activity <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.behavior}
            onChange={(e) => handleChange('mentalStatusExam', 'behavior', e.target.value)}
          >
            <option value="Calm/Cooperative">Calm/Cooperative</option>
            <option value="Agitated/Restless">Agitated/Restless</option>
            <option value="Lethargic/Slowed">Lethargic/Slowed</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.behavior === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Behavior <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.behaviorOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.behaviorOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'behaviorOther', e.target.value)}
            />
            {errors['mentalStatusExam.behaviorOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.behaviorOther']}</p>
            )}
          </div>
        )}
        
        {/* Mood & Affect */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mood & Affect <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.moodAffect}
            onChange={(e) => handleChange('mentalStatusExam', 'moodAffect', e.target.value)}
          >
            <option value="Euthymic (Normal)">Euthymic (Normal)</option>
            <option value="Depressed">Depressed</option>
            <option value="Anxious">Anxious</option>
            <option value="Labile">Labile</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.moodAffect === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Mood & Affect <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.moodAffectOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.moodAffectOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'moodAffectOther', e.target.value)}
            />
            {errors['mentalStatusExam.moodAffectOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.moodAffectOther']}</p>
            )}
          </div>
        )}
        
        {/* Speech */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Speech <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.speech}
            onChange={(e) => handleChange('mentalStatusExam', 'speech', e.target.value)}
          >
            <option value="Normal Rate/Volume">Normal Rate/Volume</option>
            <option value="Pressured">Pressured</option>
            <option value="Slow">Slow</option>
            <option value="Slurred">Slurred</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.speech === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Speech <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.speechOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.speechOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'speechOther', e.target.value)}
            />
            {errors['mentalStatusExam.speechOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.speechOther']}</p>
            )}
          </div>
        )}
        
        {/* Thought Process */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thought Process <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.thoughtProcess}
            onChange={(e) => handleChange('mentalStatusExam', 'thoughtProcess', e.target.value)}
          >
            <option value="Linear/Goal-Directed">Linear/Goal-Directed</option>
            <option value="Tangential">Tangential</option>
            <option value="Flight of Ideas">Flight of Ideas</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.thoughtProcess === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Thought Process <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.thoughtProcessOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.thoughtProcessOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'thoughtProcessOther', e.target.value)}
            />
            {errors['mentalStatusExam.thoughtProcessOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.thoughtProcessOther']}</p>
            )}
          </div>
        )}
        
        {/* Thought Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thought Content <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.thoughtContent}
            onChange={(e) => handleChange('mentalStatusExam', 'thoughtContent', e.target.value)}
          >
            <option value="Normal">Normal</option>
            <option value="Delusional">Delusional</option>
            <option value="Obsessive">Obsessive</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.thoughtContent === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Thought Content <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.thoughtContentOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.thoughtContentOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'thoughtContentOther', e.target.value)}
            />
            {errors['mentalStatusExam.thoughtContentOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.thoughtContentOther']}</p>
            )}
          </div>
        )}
        
        {/* Perceptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Perceptions <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.mentalStatusExam.perceptions}
            onChange={(e) => handleChange('mentalStatusExam', 'perceptions', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Auditory Hallucinations">Auditory Hallucinations</option>
            <option value="Visual Hallucinations">Visual Hallucinations</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {formData.mentalStatusExam.perceptions === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Perceptions <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['mentalStatusExam.perceptionsOther'] ? 'border-red-500' : ''
              }`}
              value={formData.mentalStatusExam.perceptionsOther || ''}
              onChange={(e) => handleChange('mentalStatusExam', 'perceptionsOther', e.target.value)}
            />
            {errors['mentalStatusExam.perceptionsOther'] && (
              <p className="mt-1 text-sm text-red-500">{errors['mentalStatusExam.perceptionsOther']}</p>
            )}
          </div>
        )}
        
        {/* Orientation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Orientation <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.mentalStatusExam.orientation === 'Fully Oriented'}
                onChange={() => handleChange('mentalStatusExam', 'orientation', 'Fully Oriented')}
              />
              <span className="ml-2">Fully Oriented</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.mentalStatusExam.orientation === 'Partially Oriented'}
                onChange={() => handleChange('mentalStatusExam', 'orientation', 'Partially Oriented')}
              />
              <span className="ml-2">Partially Oriented</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.mentalStatusExam.orientation === 'Disoriented'}
                onChange={() => handleChange('mentalStatusExam', 'orientation', 'Disoriented')}
              />
              <span className="ml-2">Disoriented</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step 4: Risk Assessment
  const renderRiskAssessmentStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Risk Assessment</h2>
      
      <div className="space-y-4">
        {/* Suicidal Ideation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Suicidal Ideation <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.riskAssessment.suicidalIdeation}
            onChange={(e) => handleChange('riskAssessment', 'suicidalIdeation', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Passive">Passive</option>
            <option value="Active without Plan">Active without Plan</option>
            <option value="Active with Plan">Active with Plan</option>
          </select>
        </div>
        
        {/* Homicidal Ideation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Homicidal Ideation <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.riskAssessment.homicidalIdeation}
            onChange={(e) => handleChange('riskAssessment', 'homicidalIdeation', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Passive">Passive</option>
            <option value="Active without Plan">Active without Plan</option>
            <option value="Active with Plan">Active with Plan</option>
          </select>
        </div>
        
        {/* Self-Harm History */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Self-Harm History <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.riskAssessment.selfHarmHistory === true}
                onChange={() => handleChange('riskAssessment', 'selfHarmHistory', true)}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={formData.riskAssessment.selfHarmHistory === false}
                onChange={() => handleChange('riskAssessment', 'selfHarmHistory', false)}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
        
        {formData.riskAssessment.selfHarmHistory && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Self-Harm History <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['riskAssessment.selfHarmDescription'] ? 'border-red-500' : ''
              }`}
              value={formData.riskAssessment.selfHarmDescription || ''}
              onChange={(e) => handleChange('riskAssessment', 'selfHarmDescription', e.target.value)}
            />
            {errors['riskAssessment.selfHarmDescription'] && (
              <p className="mt-1 text-sm text-red-500">{errors['riskAssessment.selfHarmDescription']}</p>
            )}
          </div>
        )}
        
        {/* Safety Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Safety Plan {formData.riskAssessment.suicidalIdeation !== 'None' || 
                        formData.riskAssessment.homicidalIdeation !== 'None' ? 
                        <span className="text-red-500">*</span> : ''}
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['riskAssessment.safetyPlan'] ? 'border-red-500' : ''
            }`}
            value={formData.riskAssessment.safetyPlan || ''}
            onChange={(e) => handleChange('riskAssessment', 'safetyPlan', e.target.value)}
          />
          {errors['riskAssessment.safetyPlan'] && (
            <p className="mt-1 text-sm text-red-500">{errors['riskAssessment.safetyPlan']}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  // Step 5: Psychosocial & Medical History
  const renderPsychosocialMedicalHistoryStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Psychosocial & Medical History</h2>
      
      <div className="space-y-4">
        {/* Family Mental Health History */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Family Mental Health History
          </label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Depression')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Depression']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Depression');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Depression</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Bipolar Disorder')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Bipolar Disorder']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Bipolar Disorder');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Bipolar Disorder</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Anxiety')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Anxiety']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Anxiety');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Anxiety</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Schizophrenia')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Schizophrenia']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Schizophrenia');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Schizophrenia</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Substance Use')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Substance Use']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Substance Use');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Substance Use</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Other')}
                onChange={(e) => {
                  const newHistory = e.target.checked
                    ? [...formData.psychosocialMedicalHistory.familyMentalHealthHistory, 'Other']
                    : formData.psychosocialMedicalHistory.familyMentalHealthHistory.filter(h => h !== 'Other');
                  handleChange('psychosocialMedicalHistory', 'familyMentalHealthHistory', newHistory);
                }}
              />
              <span className="ml-2">Other</span>
            </label>
          </div>
        </div>
        
        {formData.psychosocialMedicalHistory.familyMentalHealthHistory.includes('Other') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please describe other family history <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['psychosocialMedicalHistory.otherFamilyHistory'] ? 'border-red-500' : ''
              }`}
              value={formData.psychosocialMedicalHistory.otherFamilyHistory || ''}
              onChange={(e) => handleChange('psychosocialMedicalHistory', 'otherFamilyHistory', e.target.value)}
            />
            {errors['psychosocialMedicalHistory.otherFamilyHistory'] && (
              <p className="mt-1 text-sm text-red-500">{errors['psychosocialMedicalHistory.otherFamilyHistory']}</p>
            )}
          </div>
        )}
        
        {/* Substance Use History */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Substance Use History <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.psychosocialMedicalHistory.substanceUseHistory}
            onChange={(e) => handleChange('psychosocialMedicalHistory', 'substanceUseHistory', e.target.value)}
          >
            <option value="None">None</option>
            <option value="Occasional">Occasional</option>
            <option value="Regular">Regular</option>
            <option value="Chronic">Chronic</option>
          </select>
        </div>
        
        {/* Medical Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medical Conditions <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['psychosocialMedicalHistory.medicalConditions'] ? 'border-red-500' : ''
            }`}
            value={formData.psychosocialMedicalHistory.medicalConditions}
            onChange={(e) => handleChange('psychosocialMedicalHistory', 'medicalConditions', e.target.value)}
          />
          {errors['psychosocialMedicalHistory.medicalConditions'] && (
            <p className="mt-1 text-sm text-red-500">{errors['psychosocialMedicalHistory.medicalConditions']}</p>
          )}
        </div>
        
        {/* Social Support */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Social Support <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['psychosocialMedicalHistory.socialSupport'] ? 'border-red-500' : ''
            }`}
            value={formData.psychosocialMedicalHistory.socialSupport}
            onChange={(e) => handleChange('psychosocialMedicalHistory', 'socialSupport', e.target.value)}
          />
          {errors['psychosocialMedicalHistory.socialSupport'] && (
            <p className="mt-1 text-sm text-red-500">{errors['psychosocialMedicalHistory.socialSupport']}</p>
          )}
        </div>
        
        {/* Legal Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Legal Issues
          </label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.psychosocialMedicalHistory.legalIssues}
                onChange={(e) => handleChange('psychosocialMedicalHistory', 'legalIssues', e.target.checked)}
              />
              <span className="ml-2">Client has legal issues</span>
            </label>
          </div>
        </div>
        
        {formData.psychosocialMedicalHistory.legalIssues && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe Legal Issues <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['psychosocialMedicalHistory.legalIssuesDescription'] ? 'border-red-500' : ''
              }`}
              value={formData.psychosocialMedicalHistory.legalIssuesDescription || ''}
              onChange={(e) => handleChange('psychosocialMedicalHistory', 'legalIssuesDescription', e.target.value)}
            />
            {errors['psychosocialMedicalHistory.legalIssuesDescription'] && (
              <p className="mt-1 text-sm text-red-500">{errors['psychosocialMedicalHistory.legalIssuesDescription']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Step 6: Preliminary Diagnosis & Recommendations
  const renderDiagnosisRecommendationsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Preliminary Diagnosis & Recommendations</h2>
      
      <div className="space-y-4">
        {/* Initial Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Initial Diagnosis <span className="text-red-500">*</span>
          </label>
          <select
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['diagnosisRecommendations.initialDiagnosis'] ? 'border-red-500' : ''
            }`}
            value={formData.diagnosisRecommendations.initialDiagnosis}
            onChange={(e) => handleChange('diagnosisRecommendations', 'initialDiagnosis', e.target.value)}
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
          {errors['diagnosisRecommendations.initialDiagnosis'] && (
            <p className="mt-1 text-sm text-red-500">{errors['diagnosisRecommendations.initialDiagnosis']}</p>
          )}
        </div>
        
        {formData.diagnosisRecommendations.initialDiagnosis === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Other Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors['diagnosisRecommendations.otherDiagnosis'] ? 'border-red-500' : ''
              }`}
              value={formData.diagnosisRecommendations.otherDiagnosis || ''}
              onChange={(e) => handleChange('diagnosisRecommendations', 'otherDiagnosis', e.target.value)}
              placeholder="Enter diagnosis code and description"
            />
            {errors['diagnosisRecommendations.otherDiagnosis'] && (
              <p className="mt-1 text-sm text-red-500">{errors['diagnosisRecommendations.otherDiagnosis']}</p>
            )}
          </div>
        )}
        
        {/* Clinical Impression */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Clinical Impression <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['diagnosisRecommendations.clinicalImpression'] ? 'border-red-500' : ''
            }`}
            value={formData.diagnosisRecommendations.clinicalImpression}
            onChange={(e) => handleChange('diagnosisRecommendations', 'clinicalImpression', e.target.value)}
          />
          {errors['diagnosisRecommendations.clinicalImpression'] && (
            <p className="mt-1 text-sm text-red-500">{errors['diagnosisRecommendations.clinicalImpression']}</p>
          )}
        </div>
        
        {/* Treatment Recommendations */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Treatment Recommendations <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors['diagnosisRecommendations.treatmentRecommendations'] ? 'border-red-500' : ''
            }`}
            value={formData.diagnosisRecommendations.treatmentRecommendations}
            onChange={(e) => handleChange('diagnosisRecommendations', 'treatmentRecommendations', e.target.value)}
          />
          {errors['diagnosisRecommendations.treatmentRecommendations'] && (
            <p className="mt-1 text-sm text-red-500">{errors['diagnosisRecommendations.treatmentRecommendations']}</p>
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
          Once signed, the note is locked and any changes require an addendum. Are you sure you want to finalize this note?
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
        <h1 className="text-2xl font-bold">Intake Note</h1>
        <p className="text-gray-600">
          {isEditMode ? 'Edit existing intake note' : 'Create a new intake note'}
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
          <div className="text-xs">Client Info</div>
          <div className="text-xs">Problem</div>
          <div className="text-xs">Mental Status</div>
          <div className="text-xs">Risk</div>
          <div className="text-xs">History</div>
          <div className="text-xs">Diagnosis</div>
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

export default IntakeNoteFormComponent;
