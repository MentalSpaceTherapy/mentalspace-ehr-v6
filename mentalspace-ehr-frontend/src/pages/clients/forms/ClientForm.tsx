import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { useClient } from '../../../contexts/ClientContext';

// Step components
import BasicDemographics from './steps/BasicDemographics';
import ContactInformation from './steps/ContactInformation';
import InsuranceInformation from './steps/InsuranceInformation';
import EmergencyContact from './steps/EmergencyContact';
import ReviewConfirmation from './steps/ReviewConfirmation';

// Types
type FormStep = 'demographics' | 'contact' | 'insurance' | 'emergency' | 'review';

interface ClientFormData {
  // Step 1: Basic Demographics
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  genderOther?: string;
  
  // Step 2: Contact Information
  phone: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    countryOther?: string;
  };
  
  // Step 3: Insurance Information
  insuranceCarrier?: string;
  insuranceCarrierOther?: string;
  policyNumber?: string;
  groupNumber?: string;
  coverageStartDate?: string;
  coverageEndDate?: string;
  insuranceCardFront?: File;
  insuranceCardBack?: File;
  
  // Step 4: Emergency Contact & Additional Details
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  primaryCareProvider?: string;
  referredBy?: string;
  caseNumber?: string;
  courtMandated: boolean;
  courtMandatedNotes?: string;
}

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createClient, updateClient, fetchClientById, loading, error } = useClient();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('demographics');
  const [formData, setFormData] = useState<ClientFormData>({
    // Initialize with default values
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
    },
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    courtMandated: false,
  });
  
  const [stepValidation, setStepValidation] = useState({
    demographics: false,
    contact: false,
    insurance: true, // Insurance is optional
    emergency: false,
    review: true, // Review is always valid
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!id);
  
  // Load client data if in edit mode
  useEffect(() => {
    if (id) {
      const loadClientData = async () => {
        try {
          const clientData = await fetchClientById(id);
          if (clientData) {
            // Transform API data to form data format
            setFormData({
              firstName: clientData.firstName || '',
              lastName: clientData.lastName || '',
              preferredName: clientData.preferredName || '',
              dateOfBirth: clientData.dateOfBirth ? new Date(clientData.dateOfBirth).toISOString().split('T')[0] : '',
              gender: clientData.gender || '',
              phone: clientData.phone || '',
              email: clientData.email || '',
              address: {
                line1: clientData.address?.street || '',
                line2: '',
                city: clientData.address?.city || '',
                state: clientData.address?.state || '',
                postalCode: clientData.address?.zipCode || '',
                country: clientData.address?.country || 'USA',
              },
              emergencyContactName: clientData.emergencyContact?.name || '',
              emergencyContactRelationship: clientData.emergencyContact?.relationship || '',
              emergencyContactPhone: clientData.emergencyContact?.phone || '',
              primaryCareProvider: clientData.primaryCareProvider || '',
              referredBy: clientData.referralSource || '',
              courtMandated: false,
            });
          }
        } catch (error) {
          console.error('Error loading client data:', error);
        }
      };
      
      loadClientData();
    }
    
    // Check for saved draft in localStorage
    const savedDraft = localStorage.getItem('clientFormDraft');
    if (savedDraft && !id) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setSaveMessage('Draft loaded successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Error parsing saved draft:', error);
      }
    }
  }, [id, fetchClientById]);
  
  // Auto-save on step change
  useEffect(() => {
    const autoSaveDraft = () => {
      localStorage.setItem('clientFormDraft', JSON.stringify(formData));
    };
    
    autoSaveDraft();
  }, [currentStep, formData]);
  
  // Handle form data changes
  const handleInputChange = (step: FormStep, field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields (e.g., address.line1)
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ClientFormData],
          [child]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Handle file uploads
  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };
  
  // Validate current step
  const validateStep = (step: FormStep, isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [step]: isValid
    }));
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    switch (currentStep) {
      case 'demographics':
        setCurrentStep('contact');
        break;
      case 'contact':
        setCurrentStep('insurance');
        break;
      case 'insurance':
        setCurrentStep('emergency');
        break;
      case 'emergency':
        setCurrentStep('review');
        break;
      case 'review':
        setShowConfirmModal(true);
        break;
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'contact':
        setCurrentStep('demographics');
        break;
      case 'insurance':
        setCurrentStep('contact');
        break;
      case 'emergency':
        setCurrentStep('insurance');
        break;
      case 'review':
        setCurrentStep('emergency');
        break;
    }
  };
  
  // Save draft manually
  const saveDraft = () => {
    setIsSaving(true);
    localStorage.setItem('clientFormDraft', JSON.stringify(formData));
    setSaveMessage('Draft saved successfully');
    setTimeout(() => {
      setSaveMessage('');
      setIsSaving(false);
    }, 3000);
  };
  
  // Submit form
  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      // Transform form data to API format
      const clientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferredName: formData.preferredName,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender === 'Other' ? formData.genderOther : formData.gender,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.line1,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.postalCode,
          country: formData.address.country === 'Other' ? formData.address.countryOther : formData.address.country,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        },
        primaryCareProvider: formData.primaryCareProvider,
        referralSource: formData.referredBy,
        status: 'active',
      };
      
      if (id) {
        // Update existing client
        await updateClient(id, clientData);
      } else {
        // Create new client
        await createClient(clientData);
      }
      
      // Clear draft after successful submission
      localStorage.removeItem('clientFormDraft');
      
      // Navigate back to client directory
      navigate('/clients');
    } catch (error) {
      console.error('Error submitting client form:', error);
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };
  
  // Cancel form submission
  const cancelSubmission = () => {
    setShowConfirmModal(false);
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'demographics':
        return (
          <BasicDemographics 
            formData={formData} 
            onChange={(field, value) => handleInputChange('demographics', field, value)} 
            onValidate={(isValid) => validateStep('demographics', isValid)}
          />
        );
      case 'contact':
        return (
          <ContactInformation 
            formData={formData} 
            onChange={(field, value) => handleInputChange('contact', field, value)} 
            onValidate={(isValid) => validateStep('contact', isValid)}
          />
        );
      case 'insurance':
        return (
          <InsuranceInformation 
            formData={formData} 
            onChange={(field, value) => handleInputChange('insurance', field, value)} 
            onFileUpload={handleFileUpload}
            onValidate={(isValid) => validateStep('insurance', isValid)}
          />
        );
      case 'emergency':
        return (
          <EmergencyContact 
            formData={formData} 
            onChange={(field, value) => handleInputChange('emergency', field, value)} 
            onValidate={(isValid) => validateStep('emergency', isValid)}
          />
        );
      case 'review':
        return (
          <ReviewConfirmation 
            formData={formData} 
            onEdit={(step) => setCurrentStep(step)}
          />
        );
      default:
        return null;
    }
  };
  
  // Get step number for progress indicator
  const getStepNumber = () => {
    switch (currentStep) {
      case 'demographics': return 1;
      case 'contact': return 2;
      case 'insurance': return 3;
      case 'emergency': return 4;
      case 'review': return 5;
      default: return 1;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Client' : 'Add New Client'}
        </h1>
        <div className="mt-2 flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(getStepNumber() / 5) * 100}%` }}
            ></div>
          </div>
          <span className="ml-4 text-sm font-medium text-gray-500">
            Step {getStepNumber()} of 5
          </span>
        </div>
      </div>
      
      {/* Form content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep !== 'demographics' && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
          )}
        </div>
        
        <div className="flex items-center">
          {saveMessage && (
            <span className="mr-4 text-sm text-green-600">{saveMessage}</span>
          )}
          
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSaving}
            className="mr-4 flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={goToNextStep}
            disabled={!stepValidation[currentStep] || isSaving}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              stepValidation[currentStep] ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
            }`}
          >
            {currentStep === 'review' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Submission</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to {isEditMode ? 'update' : 'create'} this client record? 
              Once submitted, changes require additional approval or editing.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={cancelSubmission}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientForm;
