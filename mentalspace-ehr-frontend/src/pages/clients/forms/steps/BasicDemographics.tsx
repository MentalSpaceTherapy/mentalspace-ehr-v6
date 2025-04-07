import React, { useState, useEffect } from 'react';

interface BasicDemographicsProps {
  formData: {
    firstName: string;
    lastName: string;
    preferredName?: string;
    dateOfBirth: string;
    gender: string;
    genderOther?: string;
  };
  onChange: (field: string, value: any) => void;
  onValidate: (isValid: boolean) => void;
}

const BasicDemographics: React.FC<BasicDemographicsProps> = ({ formData, onChange, onValidate }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate fields on mount and when form data changes
  useEffect(() => {
    validateFields();
  }, [formData]);
  
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    
    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dateOfBirth = 'Date of Birth must be in the past';
      }
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    } else if (formData.gender === 'Other' && !formData.genderOther?.trim()) {
      newErrors.genderOther = 'Please specify gender';
    }
    
    setErrors(newErrors);
    
    // Check if all required fields are valid
    const isValid = Object.keys(newErrors).length === 0;
    onValidate(isValid);
    
    return isValid;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Basic Demographics</h2>
      <p className="text-sm text-gray-500">
        Please enter the client's basic demographic information. All fields marked with an asterisk (*) are required.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        
        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
        
        {/* Preferred Name */}
        <div>
          <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700">
            Preferred Name
          </label>
          <input
            type="text"
            id="preferredName"
            name="preferredName"
            value={formData.preferredName || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            If different from legal name
          </p>
        </div>
        
        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>
        
        {/* Gender */}
        <div className="md:col-span-2">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
          
          {/* Conditional field for "Other" gender */}
          {formData.gender === 'Other' && (
            <div className="mt-3">
              <label htmlFor="genderOther" className="block text-sm font-medium text-gray-700">
                Please specify *
              </label>
              <input
                type="text"
                id="genderOther"
                name="genderOther"
                value={formData.genderOther || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.genderOther ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.genderOther && (
                <p className="mt-1 text-sm text-red-600">{errors.genderOther}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicDemographics;
