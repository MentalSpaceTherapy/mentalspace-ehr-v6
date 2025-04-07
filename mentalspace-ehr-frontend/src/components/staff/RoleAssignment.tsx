import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, Save } from 'lucide-react';
import { Role } from '../../models/Role';

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full access to all system features and settings',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: true,
      schedule: true,
      messaging: true,
      billing: true,
      settings: true,
      staff: true
    },
    isSystemRole: true,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: '2',
    name: 'Clinician',
    description: 'Access to client records, documentation, and scheduling',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: true,
      schedule: true,
      messaging: true,
      billing: false,
      settings: false,
      staff: false
    },
    isSystemRole: true,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: '3',
    name: 'Supervisor',
    description: 'Clinical oversight with access to supervised staff records',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: true,
      schedule: true,
      messaging: true,
      billing: true,
      settings: false,
      staff: true
    },
    isSystemRole: true,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: '4',
    name: 'Scheduler',
    description: 'Manage appointments and client scheduling',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: false,
      schedule: true,
      messaging: true,
      billing: false,
      settings: false,
      staff: false
    },
    isSystemRole: true,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: '5',
    name: 'Biller',
    description: 'Manage billing, claims, and payments',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: false,
      schedule: false,
      messaging: true,
      billing: true,
      settings: false,
      staff: false
    },
    isSystemRole: true,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: '6',
    name: 'Custom Role',
    description: 'Custom permissions for specific staff needs',
    permissions: {
      dashboard: true,
      clients: true,
      documentation: true,
      schedule: false,
      messaging: true,
      billing: false,
      settings: false,
      staff: false
    },
    isSystemRole: false,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15')
  }
];

interface RoleAssignmentProps {
  staffId?: string;
  initialRoleId?: string;
  onSave?: (roleId: string) => void;
  isEditable?: boolean;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ 
  staffId, 
  initialRoleId = '2', // Default to Clinician
  onSave,
  isEditable = true
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setRoles(mockRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!isEditable) return;
    
    setIsSaving(true);
    try {
      // In a real app, this would be an API call to update the staff member's role
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onSave) {
        onSave(selectedRoleId);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRole = roles.find(role => role.id === selectedRoleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Role Assignment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Assign a role to determine access permissions
          </p>
        </div>
        {isEditable && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving
              </span>
            ) : (
              <>
                <Save className="mr-1 h-4 w-4" />
                Save
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative">
        <div 
          className={`relative border ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-50'} border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          onClick={() => isEditable && setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedRole ? (
            <div className="flex items-center">
              <span className="block truncate font-medium">{selectedRole.name}</span>
              <span className="ml-2 text-xs text-gray-500">{selectedRole.description}</span>
            </div>
          ) : (
            <span className="block truncate text-gray-500">Select a role</span>
          )}
          {isEditable && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`${
                  selectedRoleId === role.id ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'
                } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="flex items-center">
                  <span className={`${
                    selectedRoleId === role.id ? 'font-semibold' : 'font-normal'
                  } block truncate`}>
                    {role.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 truncate">{role.description}</span>
                </div>

                {selectedRoleId === role.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRole && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(selectedRole.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                  value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssignment;
