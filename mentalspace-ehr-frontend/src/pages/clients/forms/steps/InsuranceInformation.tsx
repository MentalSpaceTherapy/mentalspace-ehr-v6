import React, { useState, useEffect } from 'react';
import { CreditCard, Upload } from 'lucide-react';

interface InsuranceInformationProps {
  formData: {
    insuranceCarrier?: string;
    insuranceCarrierOther?: string;
    policyNumber?: string;
    groupNumber?: string;
    coverageStartDate?: string;
    coverageEndDate?: string;
    insuranceCardFront?: File;
    insuranceCardBack?: File;
  };
  onChange: (field: string, value: any) => void;
  onFileUpload: (field: string, file: File | null) => void;
  onValidate: (isValid: boolean) => void;
}

const InsuranceInformation: React.FC<InsuranceInformationProps> = ({ 
  formData, 
  onChange, 
  onFileUpload,
  onValidate 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInsurance, setHasInsurance] = useState<boolean>(!!formData.insuranceCarrier);
  const [frontCardPreview, setFrontCardPreview] = useState<string | null>(null);
  const [backCardPreview, setBackCardPreview] = useState<string | null>(null);
  
  // Validate fields on mount and when form data changes
  useEffect(() => {
    validateFields();
  }, [formData, hasInsurance]);
  
  // Create preview URLs for uploaded files
  useEffect(() => {
    if (formData.insuranceCardFront) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontCardPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.insuranceCardFront);
    } else {
      setFrontCardPreview(null);
    }
    
    if (formData.insuranceCardBack) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackCardPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.insuranceCardBack);
    } else {
      setBackCardPreview(null);
    }
  }, [formData.insuranceCardFront, formData.insuranceCardBack]);
  
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate if the client has insurance
    if (hasInsurance) {
      // Insurance Carrier validation
      if (!formData.insuranceCarrier) {
        newErrors.insuranceCarrier = 'Insurance Carrier is required';
      } else if (formData.insuranceCarrier === 'Other' && !formData.insuranceCarrierOther?.trim()) {
        newErrors.insuranceCarrierOther = 'Please specify insurance carrier';
      }
      
      // Policy Number validation
      if (!formData.policyNumber?.trim()) {
        newErrors.policyNumber = 'Policy Number is required';
      }
      
      // Coverage Start Date validation
      if (!formData.coverageStartDate) {
        newErrors.coverageStartDate = 'Coverage Start Date is required';
      }
      
      // Coverage End Date validation
      if (!formData.coverageEndDate) {
        newErrors.coverageEndDate = 'Coverage End Date is required';
      } else if (formData.coverageStartDate && formData.coverageEndDate) {
        const startDate = new Date(formData.coverageStartDate);
        const endDate = new Date(formData.coverageEndDate);
        
        if (endDate <= startDate) {
          newErrors.coverageEndDate = 'Coverage End Date must be after Coverage Start Date';
        }
      }
    }
    
    setErrors(newErrors);
    
    // Insurance is optional, so the form is valid if either:
    // 1. The client has no insurance (hasInsurance is false)
    // 2. The client has insurance and all required fields are valid
    const isValid = !hasInsurance || Object.keys(newErrors).length === 0;
    onValidate(isValid);
    
    return isValid;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  const handleHasInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasIns = e.target.value === 'yes';
    setHasInsurance(hasIns);
    
    // Clear insurance fields if "No" is selected
    if (!hasIns) {
      onChange('insuranceCarrier', '');
      onChange('insuranceCarrierOther', '');
      onChange('policyNumber', '');
      onChange('groupNumber', '');
      onChange('coverageStartDate', '');
      onChange('coverageEndDate', '');
      onFileUpload('insuranceCardFront', null);
      onFileUpload('insuranceCardBack', null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Check file type
      const fileType = file.type;
      if (!fileType.match(/^image\/(jpeg|png|jpg)$/) && !fileType.match(/^application\/pdf$/)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'File must be an image (JPEG, PNG) or PDF'
        }));
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      
      onFileUpload(fieldName, file);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Insurance Information</h2>
      <p className="text-sm text-gray-500">
        Please enter the client's insurance information if applicable.
      </p>
      
      {/* Has Insurance Radio Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Does the client have insurance?
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasInsurance"
              value="yes"
              checked={hasInsurance}
              onChange={handleHasInsuranceChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasInsurance"
              value="no"
              checked={!hasInsurance}
              onChange={handleHasInsuranceChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>
      
      {hasInsurance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Carrier */}
          <div className="md:col-span-2">
            <label htmlFor="insuranceCarrier" className="block text-sm font-medium text-gray-700">
              Primary Insurance Carrier *
            </label>
            <select
              id="insuranceCarrier"
              name="insuranceCarrier"
              value={formData.insuranceCarrier || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.insuranceCarrier ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">Select Insurance Carrier</option>
              <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
              <option value="Aetna">Aetna</option>
              <option value="Cigna">Cigna</option>
              <option value="UnitedHealthcare">UnitedHealthcare</option>
              <option value="Humana">Humana</option>
              <option value="Kaiser Permanente">Kaiser Permanente</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Other">Other</option>
            </select>
            {errors.insuranceCarrier && (
              <p className="mt-1 text-sm text-red-600">{errors.insuranceCarrier}</p>
            )}
            
            {/* Conditional field for "Other" insurance carrier */}
            {formData.insuranceCarrier === 'Other' && (
              <div className="mt-3">
                <label htmlFor="insuranceCarrierOther" className="block text-sm font-medium text-gray-700">
                  Please specify carrier *
                </label>
                <input
                  type="text"
                  id="insuranceCarrierOther"
                  name="insuranceCarrierOther"
                  value={formData.insuranceCarrierOther || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.insuranceCarrierOther ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.insuranceCarrierOther && (
                  <p className="mt-1 text-sm text-red-600">{errors.insuranceCarrierOther}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Policy Number */}
          <div>
            <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
              Policy Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="policyNumber"
                name="policyNumber"
                value={formData.policyNumber || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full pl-10 rounded-md shadow-sm ${
                  errors.policyNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.policyNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.policyNumber}</p>
            )}
          </div>
          
          {/* Group Number */}
          <div>
            <label htmlFor="groupNumber" className="block text-sm font-medium text-gray-700">
              Group Number
            </label>
            <input
              type="text"
              id="groupNumber"
              name="groupNumber"
              value={formData.groupNumber || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional, if available on insurance card
            </p>
          </div>
          
          {/* Coverage Start Date */}
          <div>
            <label htmlFor="coverageStartDate" className="block text-sm font-medium text-gray-700">
              Coverage Start Date *
            </label>
            <input
              type="date"
              id="coverageStartDate"
              name="coverageStartDate"
              value={formData.coverageStartDate || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.coverageStartDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.coverageStartDate && (
              <p className="mt-1 text-sm text-red-600">{errors.coverageStartDate}</p>
            )}
          </div>
          
          {/* Coverage End Date */}
          <div>
            <label htmlFor="coverageEndDate" className="block text-sm font-medium text-gray-700">
              Coverage End Date *
            </label>
            <input
              type="date"
              id="coverageEndDate"
              name="coverageEndDate"
              value={formData.coverageEndDate || ''}
              onChange={handleInputChange}
              min={formData.coverageStartDate} // Ensure end date is after start date
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.coverageEndDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.coverageEndDate && (
              <p className="mt-1 text-sm text-red-600">{errors.coverageEndDate}</p>
            )}
          </div>
          
          {/* Insurance Card Upload */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Card Images</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload scanned images or photos of the front and back of the insurance card (optional but recommended).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front of Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front of Insurance Card
                </label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {frontCardPreview ? (
                    <div className="space-y-2 text-center">
                      <div className="flex flex-col items-center">
                        <img 
                          src={frontCardPreview} 
                          alt="Front of insurance card" 
                          className="h-32 object-contain mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onFileUpload('insuranceCardFront', null);
                            setFrontCardPreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="insuranceCardFront"
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="insuranceCardFront"
                            name="insuranceCardFront"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'insuranceCardFront')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, or PDF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.insuranceCardFront && (
                  <p className="mt-1 text-sm text-red-600">{errors.insuranceCardFront}</p>
                )}
              </div>
              
              {/* Back of Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back of Insurance Card
                </label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {backCardPreview ? (
                    <div className="space-y-2 text-center">
                      <div className="flex flex-col items-center">
                        <img 
                          src={backCardPreview} 
                          alt="Back of insurance card" 
                          className="h-32 object-contain mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onFileUpload('insuranceCardBack', null);
                            setBackCardPreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="insuranceCardBack"
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="insuranceCardBack"
                            name="insuranceCardBack"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            className="sr-only"
                            onChange={(e) => handleFileChange(e, 'insuranceCardBack')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, or PDF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.insuranceCardBack && (
                  <p className="mt-1 text-sm text-red-600">{errors.insuranceCardBack}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceInformation;
