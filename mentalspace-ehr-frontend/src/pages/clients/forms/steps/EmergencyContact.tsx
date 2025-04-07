import React, { useState, useEffect } from 'react';
import { Phone, User } from 'lucide-react';

interface EmergencyContactProps {
  formData: {
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    primaryCareProvider?: string;
    referredBy?: string;
    caseNumber?: string;
    courtMandated: boolean;
    courtMandatedNotes?: string;
  };
  onChange: (field: string, value: any) => void;
  onValidate: (isValid: boolean) => void;
}

const EmergencyContact: React.FC<EmergencyContactProps> = ({ formData, onChange, onValidate }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate fields on mount and when form data changes
  useEffect(() => {
    validateFields();
  }, [formData]);
  
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    // Emergency Contact Name validation
    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency Contact Name is required';
    }
    
    // Emergency Contact Relationship validation
    if (!formData.emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship = 'Relationship is required';
    }
    
    // Emergency Contact Phone validation
    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency Contact Phone is required';
    } else {
      // Simple regex for phone format validation
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'Please enter a valid phone number (e.g., 555-123-4567)';
      }
    }
    
    // Court Mandated Notes validation (required if court-mandated is Yes)
    if (formData.courtMandated && !formData.courtMandatedNotes?.trim()) {
      newErrors.courtMandatedNotes = 'Please provide details about the court mandate';
    }
    
    setErrors(newErrors);
    
    // Check if all required fields are valid
    const isValid = Object.keys(newErrors).length === 0;
    onValidate(isValid);
    
    return isValid;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value === 'yes');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Emergency Contact & Additional Details</h2>
      <p className="text-sm text-gray-500">
        Please provide emergency contact information and additional details about the client. All fields marked with an asterisk (*) are required.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contact Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact Information</h3>
        </div>
        
        {/* Emergency Contact Name */}
        <div>
          <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
            Emergency Contact Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              className={`mt-1 block w-full pl-10 rounded-md shadow-sm ${
                errors.emergencyContactName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.emergencyContactName && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName}</p>
          )}
        </div>
        
        {/* Emergency Contact Relationship */}
        <div>
          <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700">
            Relationship to Client *
          </label>
          <input
            type="text"
            id="emergencyContactRelationship"
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={handleInputChange}
            placeholder="e.g., Parent, Spouse, Sibling"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.emergencyContactRelationship ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.emergencyContactRelationship && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyContactRelationship}</p>
          )}
        </div>
        
        {/* Emergency Contact Phone */}
        <div className="md:col-span-2">
          <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
            Emergency Contact Phone *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              placeholder="555-123-4567"
              className={`mt-1 block w-full pl-10 rounded-md shadow-sm ${
                errors.emergencyContactPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.emergencyContactPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>
          )}
        </div>
        
        {/* Additional Details Section */}
        <div className="md:col-span-2 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        </div>
        
        {/* Primary Care Provider */}
        <div>
          <label htmlFor="primaryCareProvider" className="block text-sm font-medium text-gray-700">
            Primary Care Provider
          </label>
          <input
            type="text"
            id="primaryCareProvider"
            name="primaryCareProvider"
            value={formData.primaryCareProvider || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional, but helpful for coordination of care
          </p>
        </div>
        
        {/* Referred By */}
        <div>
          <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700">
            Referred By
          </label>
          <input
            type="text"
            id="referredBy"
            name="referredBy"
            value={formData.referredBy || ''}
            onChange={handleInputChange}
            placeholder="e.g., Dr. Smith, Psychology Today, Friend"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {/* Case Number */}
        <div>
          <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">
            Case Number
          </label>
          <input
            type="text"
            id="caseNumber"
            name="caseNumber"
            value={formData.caseNumber || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            If applicable (e.g., for insurance or legal purposes)
          </p>
        </div>
        
        {/* Court-Mandated */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Court-Mandated Treatment
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="courtMandated"
                value="yes"
                checked={formData.courtMandated}
                onChange={handleRadioChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="courtMandated"
                value="no"
                checked={!formData.courtMandated}
                onChange={handleRadioChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
          
          {/* Conditional field for court-mandated details */}
          {formData.courtMandated && (
            <div className="mt-3">
              <label htmlFor="courtMandatedNotes" className="block text-sm font-medium text-gray-700">
                Please provide details *
              </label>
              <textarea
                id="courtMandatedNotes"
                name="courtMandatedNotes"
                rows={3}
                value={formData.courtMandatedNotes || ''}
                onChange={handleInputChange}
                placeholder="Please include court order details, requirements, reporting obligations, etc."
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.courtMandatedNotes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.courtMandatedNotes && (
                <p className="mt-1 text-sm text-red-600">{errors.courtMandatedNotes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;
