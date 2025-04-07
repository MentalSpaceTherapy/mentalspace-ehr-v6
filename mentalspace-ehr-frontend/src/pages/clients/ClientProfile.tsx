import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, Calendar, MapPin, AlertTriangle, 
  FileText, Clock, CreditCard, Save, ArrowLeft, Plus 
} from 'lucide-react';
import { Client } from '../../models/Client';
import { ClientFlag } from '../../models/ClientFlag';
import { InsurancePolicy } from '../../models/InsurancePolicy';
import { mockClientData } from '../../utils/mockData';

// Mock flags data
const mockClientFlags: ClientFlag[] = [
  {
    id: '1',
    clientId: '1',
    client: mockClientData[0],
    flagType: 'alert',
    title: 'Insurance expiring soon',
    description: 'Client\'s insurance policy expires at the end of the month.',
    severity: 'medium',
    isActive: true,
    startDate: new Date('2023-11-01'),
    createdById: '1',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2023-11-01')
  },
  {
    id: '2',
    clientId: '5',
    client: mockClientData[4],
    flagType: 'warning',
    title: 'Billing issue',
    description: 'Outstanding balance of $250 for over 60 days.',
    severity: 'high',
    isActive: true,
    startDate: new Date('2023-09-01'),
    createdById: '1',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-01')
  },
  {
    id: '3',
    clientId: '5',
    client: mockClientData[4],
    flagType: 'info',
    title: 'Needs updated insurance',
    description: 'Client mentioned changing insurance providers.',
    severity: 'low',
    isActive: true,
    startDate: new Date('2023-10-15'),
    createdById: '1',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-15')
  }
];

// Mock insurance policies
const mockInsurancePolicies: InsurancePolicy[] = [
  {
    id: '1',
    clientId: '1',
    client: mockClientData[0],
    insuranceCarrier: 'Blue Cross Blue Shield',
    policyNumber: 'BCBS12345678',
    groupNumber: 'GRP987654',
    subscriberName: 'John Smith',
    subscriberRelationship: 'self',
    effectiveDate: new Date('2023-01-01'),
    expirationDate: new Date('2023-12-31'),
    coverageType: 'primary',
    copayAmount: 25,
    coinsurancePercentage: 20,
    deductibleAmount: 1000,
    deductibleMet: false,
    authorizationRequired: true,
    authorizationNumber: 'AUTH123456',
    authorizationStartDate: new Date('2023-01-01'),
    authorizationEndDate: new Date('2023-12-31'),
    authorizedSessions: 20,
    authorizedSessionsUsed: 12,
    verificationDate: new Date('2023-01-05'),
    status: 'active',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05')
  },
  {
    id: '2',
    clientId: '2',
    client: mockClientData[1],
    insuranceCarrier: 'Aetna',
    policyNumber: 'AET87654321',
    subscriberName: 'Emily Johnson',
    subscriberRelationship: 'self',
    effectiveDate: new Date('2023-02-01'),
    coverageType: 'primary',
    copayAmount: 30,
    authorizationRequired: false,
    status: 'active',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05')
  }
];

const ClientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [clientFlags, setClientFlags] = useState<ClientFlag[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'insurance' | 'flags' | 'notes'>('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundClient = mockClientData.find(c => c.id === id);
        if (foundClient) {
          setClient(foundClient);
          setFormData(foundClient);
          
          // Get flags for this client
          const flags = mockClientFlags.filter(f => f.clientId === id);
          setClientFlags(flags);
          
          // Get insurance policies for this client
          const policies = mockInsurancePolicies.filter(p => p.clientId === id);
          setInsurancePolicies(policies);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClientData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to update the client
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      if (client) {
        const updatedClient = { ...client, ...formData };
        setClient(updatedClient);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getFlagSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFlagTypeIcon = (flagType: string) => {
    switch(flagType) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading && !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Client Not Found</h2>
        <p className="text-gray-600 mb-4">The client you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/clients')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 ${
                client.status === 'active' ? 'bg-green-100 text-green-800' :
                client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                client.status === 'waitlist' ? 'bg-amber-100 text-amber-800' :
                client.status === 'discharged' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
              <span>{calculateAge(client.dateOfBirth)} years old</span>
              {client.gender && (
                <>
                  <span className="mx-1">•</span>
                  <span>{client.gender}</span>
                </>
              )}
              {client.pronouns && (
                <>
                  <span className="mx-1">•</span>
                  <span>{client.pronouns}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Client
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`${
              activeTab === 'insurance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('insurance')}
          >
            Insurance
          </button>
          <button
            className={`${
              activeTab === 'flags'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('flags')}
          >
            Flags
            {clientFlags.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {clientFlags.length}
              </span>
            )}
          </button>
          <button
            className={`${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {activeTab === 'profile' && (
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-indigo-500" />
                      Personal Information
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="dateOfBirth"
                            id="dateOfBirth"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="gender"
                            id="gender"
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
                          Pronouns
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="pronouns"
                            id="pronouns"
                            value={formData.pronouns || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1">
                          <select
                            id="status"
                            name="status"
                            value={formData.status || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="waitlist">Waitlist</option>
                            <option value="discharged">Discharged</option>
                            <option value="inquiry">Inquiry</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-indigo-500" />
                      Contact Information
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <div className="mt-1">
                          <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                      Treatment Information
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="primaryProviderId" className="block text-sm font-medium text-gray-700">
                          Primary Provider
                        </label>
                        <div className="mt-1">
                          <select
                            id="primaryProviderId"
                            name="primaryProviderId"
                            value={formData.primaryProviderId || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          >
                            <option value="">Select Provider</option>
                            <option value="1">Dr. Rebecca Johnson</option>
                            <option value="2">Dr. Michael Chen</option>
                            <option value="3">Sarah Williams, LCSW</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700">
                          Referral Source
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="referralSource"
                            id="referralSource"
                            value={formData.referralSource || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="referralDate" className="block text-sm font-medium text-gray-700">
                          Referral Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="referralDate"
                            id="referralDate"
                            value={formData.referralDate ? new Date(formData.referralDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="intakeDate" className="block text-sm font-medium text-gray-700">
                          Intake Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="intakeDate"
                            id="intakeDate"
                            value={formData.intakeDate ? new Date(formData.intakeDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="dischargeDate" className="block text-sm font-medium text-gray-700">
                          Discharge Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="dischargeDate"
                            id="dischargeDate"
                            value={formData.dischargeDate ? new Date(formData.dischargeDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="dischargeReason" className="block text-sm font-medium text-gray-700">
                          Discharge Reason
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="dischargeReason"
                            id="dischargeReason"
                            value={formData.dischargeReason || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          General Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            value={formData.notes || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              !isEditing ? 'bg-gray-50' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Insurance Policies</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="mr-1 h-4 w-4" />
                Add Insurance Policy
              </button>
            </div>

            {insurancePolicies.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insurance Carrier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Policy Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coverage
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Effective Dates
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {insurancePolicies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{policy.insuranceCarrier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{policy.policyNumber}</div>
                          {policy.groupNumber && (
                            <div className="text-xs text-gray-500">Group: {policy.groupNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{policy.coverageType}</div>
                          {policy.copayAmount && (
                            <div className="text-xs text-gray-500">Copay: ${policy.copayAmount}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(policy.effectiveDate).toLocaleDateString()}
                            {policy.expirationDate && ` - ${new Date(policy.expirationDate).toLocaleDateString()}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            policy.status === 'active' ? 'bg-green-100 text-green-800' :
                            policy.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {policy.status.replace('_', ' ').charAt(0).toUpperCase() + policy.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            View
                          </button>
                          <span className="mx-2 text-gray-300">|</span>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-500">No insurance policies found for this client.</p>
                <button className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Insurance Policy
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Client Flags</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Plus className="mr-1 h-4 w-4" />
                Add Flag
              </button>
            </div>

            {clientFlags.length > 0 ? (
              <div className="space-y-4">
                {clientFlags.map((flag) => (
                  <div key={flag.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                      <div className="flex items-center">
                        {getFlagTypeIcon(flag.flagType)}
                        <h3 className="ml-2 text-lg leading-6 font-medium text-gray-900">{flag.title}</h3>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getFlagSeverityColor(flag.severity)}`}>
                          {flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <p className="text-sm text-gray-500">{flag.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Added on {new Date(flag.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-500">No flags found for this client.</p>
                <button className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Flag
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Client Notes</h3>
              <p className="text-gray-500">This feature will be implemented in the next phase.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
