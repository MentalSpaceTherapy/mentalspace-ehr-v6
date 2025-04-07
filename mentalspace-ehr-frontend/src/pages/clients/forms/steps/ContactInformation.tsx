import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface ContactInformationProps {
  formData: {
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
  };
  onChange: (field: string, value: any) => void;
  onValidate: (isValid: boolean) => void;
}

const ContactInformation: React.FC<ContactInformationProps> = ({ formData, onChange, onValidate }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Validate fields on mount and when form data changes
  useEffect(() => {
    validateFields();
  }, [formData]);
  
  // Mock function for address auto-complete
  // In a real implementation, this would use Google Maps API or similar
  const fetchAddressSuggestions = (input: string) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    // Mock suggestions based on input
    const mockSuggestions = [
      `${input}, 123 Main St, Anytown, CA`,
      `${input}, 456 Oak Ave, Somecity, NY`,
      `${input}, 789 Pine Rd, Otherville, TX`,
    ];
    
    setAddressSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };
  
  const selectAddressSuggestion = (suggestion: string) => {
    // In a real implementation, this would parse the selected address
    // and fill in all the address fields
    const parts = suggestion.split(', ');
    
    if (parts.length >= 4) {
      const [street, city, stateWithZip] = parts.slice(1);
      const [state, postalCode] = stateWithZip.split(' ');
      
      onChange('address.line1', street);
      onChange('address.city', city);
      onChange('address.state', state);
      onChange('address.postalCode', postalCode || '');
    } else {
      onChange('address.line1', suggestion);
    }
    
    setShowSuggestions(false);
  };
  
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else {
      // Simple regex for phone format validation
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g., 555-123-4567)';
      }
    }
    
    // Email validation (optional but must be valid if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Address validation
    if (!formData.address.line1.trim()) {
      newErrors['address.line1'] = 'Address Line 1 is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State/Province is required';
    }
    
    if (!formData.address.postalCode.trim()) {
      newErrors['address.postalCode'] = 'Postal Code is required';
    }
    
    if (!formData.address.country) {
      newErrors['address.country'] = 'Country is required';
    } else if (formData.address.country === 'Other' && !formData.address.countryOther?.trim()) {
      newErrors['address.countryOther'] = 'Please specify country';
    }
    
    setErrors(newErrors);
    
    // Check if all required fields are valid
    const isValid = Object.keys(newErrors).length === 0;
    onValidate(isValid);
    
    return isValid;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      // For address fields, we need to update the nested object
      const addressField = name.split('.')[1];
      onChange(name, value);
      
      // If this is the address line 1 field, fetch suggestions
      if (addressField === 'line1') {
        fetchAddressSuggestions(value);
      }
    } else {
      onChange(name, value);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
      <p className="text-sm text-gray-500">
        Please enter the client's contact information. All fields marked with an asterisk (*) are required.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="555-123-4567"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            placeholder="client@example.com"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional, but recommended for appointment reminders
          </p>
        </div>
        
        {/* Address Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
        </div>
        
        {/* Address Line 1 with Auto-Complete */}
        <div className="md:col-span-2 relative">
          <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700">
            Address Line 1 *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="address.line1"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleInputChange}
              onFocus={() => formData.address.line1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Street address"
              className={`mt-1 block w-full pl-10 rounded-md shadow-sm ${
                errors['address.line1'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors['address.line1'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.line1']}</p>
          )}
          
          {/* Address suggestions dropdown */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {addressSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                  onClick={() => selectAddressSuggestion(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Address Line 2 */}
        <div className="md:col-span-2">
          <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            type="text"
            id="address.line2"
            name="address.line2"
            value={formData.address.line2 || ''}
            onChange={handleInputChange}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {/* City */}
        <div>
          <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            id="address.city"
            name="address.city"
            value={formData.address.city}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors['address.city'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors['address.city'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
          )}
        </div>
        
        {/* State/Province */}
        <div>
          <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
            State/Province *
          </label>
          <input
            type="text"
            id="address.state"
            name="address.state"
            value={formData.address.state}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors['address.state'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors['address.state'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>
          )}
        </div>
        
        {/* Postal Code */}
        <div>
          <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code *
          </label>
          <input
            type="text"
            id="address.postalCode"
            name="address.postalCode"
            value={formData.address.postalCode}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors['address.postalCode'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors['address.postalCode'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.postalCode']}</p>
          )}
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <select
            id="address.country"
            name="address.country"
            value={formData.address.country}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors['address.country'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            <option value="">Select Country</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="Other">Other</option>
          </select>
          {errors['address.country'] && (
            <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>
          )}
          
          {/* Conditional field for "Other" country */}
          {formData.address.country === 'Other' && (
            <div className="mt-3">
              <label htmlFor="address.countryOther" className="block text-sm font-medium text-gray-700">
                Please specify country *
              </label>
              <input
                type="text"
                id="address.countryOther"
                name="address.countryOther"
                value={formData.address.countryOther || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors['address.countryOther'] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors['address.countryOther'] && (
                <p className="mt-1 text-sm text-red-600">{errors['address.countryOther']}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
