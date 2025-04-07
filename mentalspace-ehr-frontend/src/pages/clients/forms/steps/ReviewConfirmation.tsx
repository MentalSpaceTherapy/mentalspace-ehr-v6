import React from 'react';
import { Edit, User, Phone, Mail, MapPin, Calendar, CreditCard, AlertTriangle } from 'lucide-react';

interface ReviewConfirmationProps {
  formData: {
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
  };
  onEdit: (step: 'demographics' | 'contact' | 'insurance' | 'emergency') => void;
}

const ReviewConfirmation: React.FC<ReviewConfirmationProps> = ({ formData, onEdit }) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Get formatted gender
  const getFormattedGender = () => {
    if (formData.gender === 'Other') {
      return formData.genderOther || 'Other';
    }
    return formData.gender || 'Not specified';
  };
  
  // Get formatted country
  const getFormattedCountry = () => {
    if (formData.address.country === 'Other') {
      return formData.address.countryOther || 'Other';
    }
    return formData.address.country || 'Not specified';
  };
  
  // Get formatted insurance carrier
  const getFormattedInsuranceCarrier = () => {
    if (!formData.insuranceCarrier) return 'None';
    
    if (formData.insuranceCarrier === 'Other') {
      return formData.insuranceCarrierOther || 'Other';
    }
    return formData.insuranceCarrier;
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Review & Confirmation</h2>
      <p className="text-sm text-gray-500">
        Please review all the information you've entered. You can edit any section by clicking the "Edit" button.
        Once you've confirmed everything is correct, click "Submit" at the bottom of the page.
      </p>
      
      {/* Basic Demographics Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Basic Demographics</h3>
          <button
            type="button"
            onClick={() => onEdit('demographics')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base text-gray-900">
                  {formData.firstName} {formData.lastName}
                  {formData.preferredName && ` (Preferred: ${formData.preferredName})`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-base text-gray-900">
                  {formatDate(formData.dateOfBirth)} ({calculateAge(formData.dateOfBirth)} years old)
                </p>
              </div>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-base text-gray-900">{getFormattedGender()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <button
            type="button"
            onClick={() => onEdit('contact')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-base text-gray-900">{formData.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-base text-gray-900">{formData.email || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base text-gray-900">
                  {formData.address.line1}
                  {formData.address.line2 && `, ${formData.address.line2}`}
                  <br />
                  {formData.address.city}, {formData.address.state} {formData.address.postalCode}
                  <br />
                  {getFormattedCountry()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insurance Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
          <button
            type="button"
            onClick={() => onEdit('insurance')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="px-6 py-4">
          {formData.insuranceCarrier ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Carrier</p>
                  <p className="text-base text-gray-900">{getFormattedInsuranceCarrier()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Policy Number</p>
                  <p className="text-base text-gray-900">{formData.policyNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Group Number</p>
                  <p className="text-base text-gray-900">{formData.groupNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Coverage Period</p>
                  <p className="text-base text-gray-900">
                    {formatDate(formData.coverageStartDate)} to {formatDate(formData.coverageEndDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start md:col-span-2">
                <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Card</p>
                  <p className="text-base text-gray-900">
                    {formData.insuranceCardFront ? 'Front image uploaded' : 'No front image'} | 
                    {formData.insuranceCardBack ? ' Back image uploaded' : ' No back image'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-base text-gray-900">No insurance information provided</p>
          )}
        </div>
      </div>
      
      {/* Emergency Contact & Additional Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Emergency Contact & Additional Details</h3>
          <button
            type="button"
            onClick={() => onEdit('emergency')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                <p className="text-base text-gray-900">
                  {formData.emergencyContactName} ({formData.emergencyContactRelationship})
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Emergency Contact Phone</p>
                <p className="text-base text-gray-900">{formData.emergencyContactPhone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Primary Care Provider</p>
                <p className="text-base text-gray-900">{formData.primaryCareProvider || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Referred By</p>
                <p className="text-base text-gray-900">{formData.referredBy || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Case Number</p>
                <p className="text-base text-gray-900">{formData.caseNumber || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Court-Mandated Treatment</p>
                <p className="text-base text-gray-900">{formData.courtMandated ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            {formData.courtMandated && (
              <div className="flex items-start md:col-span-2">
                <div className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Court-Mandated Details</p>
                  <p className="text-base text-gray-900">{formData.courtMandatedNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please review all information carefully before submitting. Once submitted, changes to this client record will require additional approval or editing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewConfirmation;
