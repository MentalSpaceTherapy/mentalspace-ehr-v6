import React, { useState, useEffect } from 'react';
import { Staff } from '../../models/Staff';
import { SupervisionRelationship } from '../../models/SupervisionRelationship';
import { Plus, Calendar, Clock, Edit, Trash, Save } from 'lucide-react';

// Mock staff data
const mockStaffData: Staff[] = [
  {
    id: '1',
    firstName: 'Rebecca',
    lastName: 'Johnson',
    email: 'rebecca@mentalspace.com',
    phone: '(555) 123-4567',
    role: 'clinician',
    title: 'Clinical Psychologist',
    licenseNumber: 'PSY12345',
    licenseType: 'Psychologist',
    licenseExpirationDate: new Date('2026-05-15'),
    npi: '1234567890',
    specialties: ['Anxiety', 'Depression', 'Trauma'],
    status: 'active',
    hireDate: new Date('2022-03-10'),
    createdAt: new Date('2022-03-10'),
    updatedAt: new Date('2023-11-05')
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@mentalspace.com',
    phone: '(555) 234-5678',
    role: 'supervisor',
    title: 'Clinical Director',
    licenseNumber: 'PSY23456',
    licenseType: 'Psychologist',
    licenseExpirationDate: new Date('2025-08-22'),
    npi: '2345678901',
    specialties: ['Supervision', 'Group Therapy', 'Family Systems'],
    status: 'active',
    hireDate: new Date('2021-01-15'),
    createdAt: new Date('2021-01-15'),
    updatedAt: new Date('2023-10-20')
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@mentalspace.com',
    phone: '(555) 345-6789',
    role: 'clinician',
    title: 'Licensed Clinical Social Worker',
    licenseNumber: 'LCSW7890',
    licenseType: 'LCSW',
    licenseExpirationDate: new Date('2024-11-30'),
    npi: '3456789012',
    specialties: ['Children', 'Adolescents', 'Family Therapy'],
    status: 'active',
    hireDate: new Date('2022-06-01'),
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2023-09-15')
  }
];

// Mock supervision relationships
const mockSupervisionRelationships: SupervisionRelationship[] = [
  {
    id: '1',
    supervisorId: '2',
    supervisor: mockStaffData[1],
    superviseeId: '1',
    supervisee: mockStaffData[0],
    relationshipType: 'clinical',
    startDate: new Date('2022-03-15'),
    status: 'active',
    meetingFrequency: 'weekly',
    notes: 'Weekly supervision on Tuesdays at 2pm',
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2022-03-15')
  },
  {
    id: '2',
    supervisorId: '2',
    supervisor: mockStaffData[1],
    superviseeId: '3',
    supervisee: mockStaffData[2],
    relationshipType: 'clinical',
    startDate: new Date('2022-06-10'),
    status: 'active',
    meetingFrequency: 'biweekly',
    notes: 'Biweekly supervision on Thursdays at 10am',
    createdAt: new Date('2022-06-10'),
    updatedAt: new Date('2022-06-10')
  }
];

interface SupervisionRelationshipComponentProps {
  staffId?: string;
  isSupervisor?: boolean;
}

const SupervisionRelationshipComponent: React.FC<SupervisionRelationshipComponentProps> = ({
  staffId = '1',
  isSupervisor = false
}) => {
  const [relationships, setRelationships] = useState<SupervisionRelationship[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<Staff[]>([]);
  const [availableSupervisees, setAvailableSupervisees] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  
  const [newRelationship, setNewRelationship] = useState<Partial<SupervisionRelationship>>({
    supervisorId: isSupervisor ? staffId : '',
    superviseeId: isSupervisor ? '' : staffId,
    relationshipType: 'clinical',
    startDate: new Date(),
    status: 'active',
    meetingFrequency: 'weekly',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter relationships based on staffId and role
        const filteredRelationships = mockSupervisionRelationships.filter(rel => 
          isSupervisor ? rel.supervisorId === staffId : rel.superviseeId === staffId
        );
        
        setRelationships(filteredRelationships);
        
        // Get available supervisors (staff with supervisor role)
        const supervisors = mockStaffData.filter(staff => staff.role === 'supervisor');
        setAvailableSupervisors(supervisors);
        
        // Get available supervisees (staff who are not supervisors)
        const supervisees = mockStaffData.filter(staff => staff.role !== 'supervisor');
        setAvailableSupervisees(supervisees);
      } catch (error) {
        console.error('Error fetching supervision data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [staffId, isSupervisor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRelationship(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRelationship(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };

  const handleAddRelationship = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new relationship with mock data
      const supervisor = availableSupervisors.find(s => s.id === newRelationship.supervisorId);
      const supervisee = availableSupervisees.find(s => s.id === newRelationship.superviseeId);
      
      if (!supervisor || !supervisee) {
        console.error('Supervisor or supervisee not found');
        return;
      }
      
      const newRel: SupervisionRelationship = {
        id: `new-${Date.now()}`,
        supervisorId: newRelationship.supervisorId!,
        supervisor,
        superviseeId: newRelationship.superviseeId!,
        supervisee,
        relationshipType: newRelationship.relationshipType as 'clinical' | 'administrative' | 'both',
        startDate: newRelationship.startDate!,
        endDate: newRelationship.endDate,
        status: newRelationship.status as 'active' | 'inactive' | 'pending',
        meetingFrequency: newRelationship.meetingFrequency as 'weekly' | 'biweekly' | 'monthly',
        notes: newRelationship.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setRelationships(prev => [...prev, newRel]);
      setIsAddingNew(false);
      setNewRelationship({
        supervisorId: isSupervisor ? staffId : '',
        superviseeId: isSupervisor ? '' : staffId,
        relationshipType: 'clinical',
        startDate: new Date(),
        status: 'active',
        meetingFrequency: 'weekly',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding supervision relationship:', error);
    }
  };

  const handleUpdateRelationship = async (id: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the relationship in the local state
      setRelationships(prev => 
        prev.map(rel => rel.id === id ? { ...rel, ...newRelationship, updatedAt: new Date() } : rel)
      );
      
      setEditingRelationshipId(null);
    } catch (error) {
      console.error('Error updating supervision relationship:', error);
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supervision relationship?')) {
      return;
    }
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove the relationship from the local state
      setRelationships(prev => prev.filter(rel => rel.id !== id));
    } catch (error) {
      console.error('Error deleting supervision relationship:', error);
    }
  };

  const startEditing = (relationship: SupervisionRelationship) => {
    setNewRelationship({
      supervisorId: relationship.supervisorId,
      superviseeId: relationship.superviseeId,
      relationshipType: relationship.relationshipType,
      startDate: relationship.startDate,
      endDate: relationship.endDate,
      status: relationship.status,
      meetingFrequency: relationship.meetingFrequency,
      notes: relationship.notes
    });
    setEditingRelationshipId(relationship.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {isSupervisor ? 'Supervision Provided' : 'Supervision Received'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isSupervisor 
              ? 'Staff members you supervise' 
              : 'Your clinical supervisors'}
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add {isSupervisor ? 'Supervisee' : 'Supervisor'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingRelationshipId) && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            {editingRelationshipId ? 'Edit Supervision Relationship' : 'Add New Supervision Relationship'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supervisor */}
            <div>
              <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor
              </label>
              <select
                id="supervisorId"
                name="supervisorId"
                value={newRelationship.supervisorId}
                onChange={handleInputChange}
                disabled={isSupervisor}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select Supervisor</option>
                {availableSupervisors.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.firstName} {supervisor.lastName} ({supervisor.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisee */}
            <div>
              <label htmlFor="superviseeId" className="block text-sm font-medium text-gray-700 mb-1">
                Supervisee
              </label>
              <select
                id="superviseeId"
                name="superviseeId"
                value={newRelationship.superviseeId}
                onChange={handleInputChange}
                disabled={!isSupervisor}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select Supervisee</option>
                {availableSupervisees.map(supervisee => (
                  <option key={supervisee.id} value={supervisee.id}>
                    {supervisee.firstName} {supervisee.lastName} ({supervisee.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Relationship Type */}
            <div>
              <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type
              </label>
              <select
                id="relationshipType"
                name="relationshipType"
                value={newRelationship.relationshipType}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="clinical">Clinical</option>
                <option value="administrative">Administrative</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Meeting Frequency */}
            <div>
              <label htmlFor="meetingFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Frequency
              </label>
              <select
                id="meetingFrequency"
                name="meetingFrequency"
                value={newRelationship.meetingFrequency}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={newRelationship.startDate ? new Date(newRelationship.startDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            {/* End Date (optional) */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newRelationship.endDate ? new Date(newRelationship.endDate).toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={newRelationship.status}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={newRelationship.notes || ''}
                onChange={handleInputChange}
                placeholder="E.g., Meeting schedule, focus areas, etc."
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingRelationshipId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => editingRelationshipId ? handleUpdateRelationship(editingRelationshipId) : handleAddRelationship()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="mr-2 h-4 w-4" />
              {editingRelationshipId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Relationships List */}
      {relationships.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isSupervisor ? 'Supervisee' : 'Supervisor'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
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
              {relationships.map((relationship) => (
                <tr key={relationship.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {isSupervisor 
                            ? `${relationship.supervisee.firstName.charAt(0)}${relationship.supervisee.lastName.charAt(0)}`
                            : `${relationship.supervisor.firstName.charAt(0)}${relationship.supervisor.lastName.charAt(0)}`
                          }
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {isSupervisor 
                            ? `${relationship.supervisee.firstName} ${relationship.supervisee.lastName}`
                            : `${relationship.supervisor.firstName} ${relationship.supervisor.lastName}`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {isSupervisor 
                            ? relationship.supervisee.title
                            : relationship.supervisor.title
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {relationship.relationshipType.charAt(0).toUpperCase() + relationship.relationshipType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {relationship.meetingFrequency.charAt(0).toUpperCase() + relationship.meetingFrequency.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span>
                        {new Date(relationship.startDate).toLocaleDateString()}
                        {relationship.endDate && ` - ${new Date(relationship.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      relationship.status === 'active' ? 'bg-green-100 text-green-800' :
                      relationship.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEditing(relationship)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRelationship(relationship.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500">
            No {isSupervisor ? 'supervisees' : 'supervisors'} found.
          </p>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add {isSupervisor ? 'Supervisee' : 'Supervisor'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SupervisionRelationshipComponent;
