import React, { useState } from 'react';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import { Staff, StaffStatus } from '../models/Staff';

// Mock data for staff directory
const mockStaffData: Staff[] = [
  {
    id: '1',
    firstName: 'Rebecca',
    lastName: 'Johnson',
    email: 'rebecca@mentalspace.com',
    phone: '(555) 123-4567',
    role: 'clinician',
    title: 'Clinical Psychologist',
    status: 'Active',
    hireDate: '2022-03-10',
    createdAt: '2022-03-10',
    updatedAt: '2023-11-05'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@mentalspace.com',
    phone: '(555) 234-5678',
    role: 'supervisor',
    title: 'Clinical Director',
    status: 'Active',
    hireDate: '2021-01-15',
    createdAt: '2021-01-15',
    updatedAt: '2023-10-20'
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@mentalspace.com',
    phone: '(555) 345-6789',
    role: 'clinician',
    title: 'Licensed Clinical Social Worker',
    status: 'Active',
    hireDate: '2022-06-01',
    createdAt: '2022-06-01',
    updatedAt: '2023-09-15'
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Rodriguez',
    email: 'james@mentalspace.com',
    phone: '(555) 456-7890',
    role: 'scheduler',
    title: 'Office Manager',
    status: 'Active',
    hireDate: '2022-08-15',
    createdAt: '2022-08-15',
    updatedAt: '2023-07-10'
  },
  {
    id: '5',
    firstName: 'Emily',
    lastName: 'Taylor',
    email: 'emily@mentalspace.com',
    phone: '(555) 567-8901',
    role: 'biller',
    title: 'Billing Specialist',
    status: 'Active',
    hireDate: '2023-01-10',
    createdAt: '2023-01-10',
    updatedAt: '2023-08-05'
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david@mentalspace.com',
    phone: '(555) 678-9012',
    role: 'admin',
    title: 'Practice Administrator',
    status: 'Active',
    hireDate: '2021-05-20',
    createdAt: '2021-05-20',
    updatedAt: '2023-06-15'
  }
];

const StaffDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor'>('all');
  const [staffData] = useState<Staff[]>(mockStaffData);

  // Filter staff based on search term and filters
  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = 
      searchTerm === '' || 
      staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.title && staff.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'clinician':
        return 'bg-blue-100 text-blue-800';
      case 'supervisor':
        return 'bg-indigo-100 text-indigo-800';
      case 'scheduler':
        return 'bg-green-100 text-green-800';
      case 'biller':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'On Leave':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Add Staff Member
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or title..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filter:</span>
          </div>
          
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | StaffStatus)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor')}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="clinician">Clinician</option>
              <option value="supervisor">Supervisor</option>
              <option value="scheduler">Scheduler</option>
              <option value="biller">Biller</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hire Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {staff.firstName} {staff.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {staff.title || 'No title'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(staff.role)}`}>
                      {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.email}</div>
                    <div className="text-sm text-gray-500">{staff.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(staff.status)}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(staff.hireDate).toLocaleDateString()}
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
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No staff members found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDirectory;
