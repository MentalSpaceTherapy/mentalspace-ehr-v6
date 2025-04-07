import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, X, Calendar, Clock, Check } from 'lucide-react';
import { Waitlist } from '../../models/Waitlist';
import { Client } from '../../models/Client';

// Mock data for waitlist
const mockWaitlistData: Waitlist[] = [
  {
    id: '1',
    clientId: '4',
    client: {
      id: '4',
      firstName: 'Sophia',
      lastName: 'Garcia',
      dateOfBirth: new Date('2001-07-19'),
      email: 'sophia.garcia@example.com',
      phone: '(555) 456-7890',
      gender: 'Female',
      pronouns: 'she/her',
      status: 'waitlist',
      referralSource: 'Website',
      referralDate: new Date('2023-11-01'),
      flags: ['High priority'],
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2023-11-01')
    },
    requestDate: new Date('2023-11-01'),
    status: 'pending',
    priority: 'high',
    serviceRequested: 'Individual Therapy',
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    preferredTimes: ['Afternoon', 'Evening'],
    preferredProviders: ['1'],
    notes: 'Client is seeking help for anxiety and depression. Prefers female therapist.',
    contactAttempts: [
      {
        date: new Date('2023-11-02'),
        method: 'phone',
        successful: false,
        notes: 'Left voicemail'
      },
      {
        date: new Date('2023-11-03'),
        method: 'email',
        successful: true,
        notes: 'Client responded, confirmed interest'
      }
    ],
    lastContactAttempt: new Date('2023-11-03'),
    estimatedWaitTime: '2-3 weeks',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2023-11-03')
  },
  {
    id: '2',
    clientId: '6',
    client: {
      id: '6',
      firstName: 'Olivia',
      lastName: 'Martinez',
      dateOfBirth: new Date('1998-12-03'),
      email: 'olivia.martinez@example.com',
      phone: '(555) 678-9012',
      gender: 'Female',
      pronouns: 'she/her',
      status: 'inquiry',
      referralSource: 'Psychology Today',
      referralDate: new Date('2023-11-10'),
      createdAt: new Date('2023-11-10'),
      updatedAt: new Date('2023-11-10')
    },
    requestDate: new Date('2023-11-10'),
    status: 'pending',
    priority: 'medium',
    serviceRequested: 'Couples Therapy',
    preferredDays: ['Tuesday', 'Thursday'],
    preferredTimes: ['Evening'],
    notes: 'Client and partner seeking couples therapy. Both work full-time.',
    contactAttempts: [
      {
        date: new Date('2023-11-11'),
        method: 'phone',
        successful: true,
        notes: 'Spoke with client, explained waitlist process'
      }
    ],
    lastContactAttempt: new Date('2023-11-11'),
    estimatedWaitTime: '3-4 weeks',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-11')
  },
  {
    id: '3',
    clientId: '7',
    client: {
      id: '7',
      firstName: 'James',
      lastName: 'Wilson',
      dateOfBirth: new Date('1990-05-12'),
      email: 'james.wilson@example.com',
      phone: '(555) 789-0123',
      gender: 'Male',
      status: 'waitlist',
      referralSource: 'Doctor Referral',
      referralDate: new Date('2023-10-25'),
      createdAt: new Date('2023-10-25'),
      updatedAt: new Date('2023-10-25')
    },
    requestDate: new Date('2023-10-25'),
    status: 'contacted',
    priority: 'low',
    serviceRequested: 'Individual Therapy',
    preferredDays: ['Monday', 'Wednesday'],
    preferredTimes: ['Morning'],
    preferredProviders: ['2'],
    notes: 'Client seeking therapy for work-related stress.',
    contactAttempts: [
      {
        date: new Date('2023-10-26'),
        method: 'email',
        successful: true,
        notes: 'Sent intake forms'
      },
      {
        date: new Date('2023-10-30'),
        method: 'phone',
        successful: true,
        notes: 'Client confirmed receipt of forms, will return soon'
      }
    ],
    lastContactAttempt: new Date('2023-10-30'),
    estimatedWaitTime: '4-5 weeks',
    createdAt: new Date('2023-10-25'),
    updatedAt: new Date('2023-10-30')
  }
];

const WaitlistManagement: React.FC = () => {
  const [waitlistItems, setWaitlistItems] = useState<Waitlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'scheduled' | 'removed'>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newContactAttempt, setNewContactAttempt] = useState<{
    waitlistId: string;
    method: 'phone' | 'email' | 'text' | 'other';
    successful: boolean;
    notes: string;
  } | null>(null);

  useEffect(() => {
    const fetchWaitlist = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setWaitlistItems(mockWaitlistData);
      } catch (error) {
        console.error('Error fetching waitlist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlist();
  }, []);

  const filteredWaitlist = waitlistItems.filter(item => {
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch(priority) {
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

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddContactAttempt = (waitlistId: string) => {
    setNewContactAttempt({
      waitlistId,
      method: 'phone',
      successful: false,
      notes: ''
    });
  };

  const handleSaveContactAttempt = async () => {
    if (!newContactAttempt) return;
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the waitlist item with the new contact attempt
      setWaitlistItems(prev => prev.map(item => {
        if (item.id === newContactAttempt.waitlistId) {
          const newAttempt = {
            date: new Date(),
            method: newContactAttempt.method,
            successful: newContactAttempt.successful,
            notes: newContactAttempt.notes
          };
          
          const contactAttempts = item.contactAttempts ? [...item.contactAttempts, newAttempt] : [newAttempt];
          
          return {
            ...item,
            contactAttempts,
            lastContactAttempt: new Date(),
            status: newContactAttempt.successful ? 'contacted' : item.status,
            updatedAt: new Date()
          };
        }
        return item;
      }));
      
      setNewContactAttempt(null);
    } catch (error) {
      console.error('Error saving contact attempt:', error);
    }
  };

  const handleScheduleClient = async (waitlistId: string) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the waitlist item status to scheduled
      setWaitlistItems(prev => prev.map(item => {
        if (item.id === waitlistId) {
          return {
            ...item,
            status: 'scheduled',
            updatedAt: new Date()
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error scheduling client:', error);
    }
  };

  const handleRemoveFromWaitlist = async (waitlistId: string) => {
    if (!window.confirm('Are you sure you want to remove this client from the waitlist?')) {
      return;
    }
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the waitlist item status to removed
      setWaitlistItems(prev => prev.map(item => {
        if (item.id === waitlistId) {
          return {
            ...item,
            status: 'removed',
            updatedAt: new Date()
          };
        }
        return item;
      }));
    } catch (error) {
      console.error('Error removing client from waitlist:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
        <button 
          onClick={() => setIsAddingNew(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add to Waitlist
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priorityFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Waitlist */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredWaitlist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Requested
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wait Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWaitlist.map((waitlistItem) => (
                  <tr key={waitlistItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {waitlistItem.client.firstName.charAt(0)}{waitlistItem.client.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {waitlistItem.client.firstName} {waitlistItem.client.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateAge(waitlistItem.client.dateOfBirth)} years • {waitlistItem.client.gender || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{waitlistItem.serviceRequested}</div>
                      <div className="text-xs text-gray-500">
                        {waitlistItem.preferredDays && waitlistItem.preferredDays.join(', ')}
                        {waitlistItem.preferredTimes && ` • ${waitlistItem.preferredTimes.join(', ')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span>
                          {new Date(waitlistItem.requestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {waitlistItem.estimatedWaitTime || 'Not estimated'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(waitlistItem.priority)}`}>
                        {waitlistItem.priority.charAt(0).toUpperCase() + waitlistItem.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(waitlistItem.status)}`}>
                        {waitlistItem.status.charAt(0).toUpperCase() + waitlistItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {waitlistItem.lastContactAttempt ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {new Date(waitlistItem.lastContactAttempt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No contact yet</span>
                      )}
                      <div className="text-xs text-gray-500">
                        {waitlistItem.contactAttempts && waitlistItem.contactAttempts.length > 0 
                          ? `${waitlistItem.contactAttempts.length} attempt(s)` 
                          : 'No attempts'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleAddContactAttempt(waitlistItem.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={waitlistItem.status === 'scheduled' || waitlistItem.status === 'removed'}
                        >
                          Contact
                        </button>
                        <button
                          onClick={() => handleScheduleClient(waitlistItem.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={waitlistItem.status === 'scheduled' || waitlistItem.status === 'removed'}
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleRemoveFromWaitlist(waitlistItem.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={waitlistItem.status === 'removed'}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No waitlist items found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Contact Attempt Modal */}
      {newContactAttempt && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Record Contact Attempt</h3>
              <button
                onClick={() => setNewContactAttempt(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Method
                </label>
                <select
                  id="contactMethod"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={newContactAttempt.method}
                  onChange={(e) => setNewContactAttempt({
                    ...newContactAttempt,
                    method: e.target.value as any
                  })}
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="text">Text</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Successful?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      checked={newContactAttempt.successful}
                      onChange={() => setNewContactAttempt({
                        ...newContactAttempt,
                        successful: true
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      checked={!newContactAttempt.successful}
                      onChange={() => setNewContactAttempt({
                        ...newContactAttempt,
                        successful: false
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="contactNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="contactNotes"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter details about the contact attempt..."
                  value={newContactAttempt.notes}
                  onChange={(e) => setNewContactAttempt({
                    ...newContactAttempt,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setNewContactAttempt(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSaveContactAttempt}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Waitlist Modal - Placeholder for now */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Client to Waitlist</h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500">This feature will be implemented in the next phase.</p>
            </div>
            
            <div className="mt-5 sm:mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsAddingNew(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistManagement;
