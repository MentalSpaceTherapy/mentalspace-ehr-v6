import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, AlertTriangle } from 'lucide-react';
import { Client } from '../../models/Client';

// Mock data for client directory
const mockClientData: Client[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1985-06-15'),
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    gender: 'Male',
    pronouns: 'he/him',
    status: 'active',
    primaryProviderId: '1',
    intakeDate: new Date('2023-01-10'),
    flags: ['Insurance expiring soon'],
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-11-05')
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Johnson',
    dateOfBirth: new Date('1992-03-22'),
    email: 'emily.johnson@example.com',
    phone: '(555) 234-5678',
    gender: 'Female',
    pronouns: 'she/her',
    status: 'active',
    primaryProviderId: '1',
    intakeDate: new Date('2023-02-15'),
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-10-20')
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Williams',
    dateOfBirth: new Date('1978-11-08'),
    email: 'michael.williams@example.com',
    phone: '(555) 345-6789',
    gender: 'Male',
    pronouns: 'he/him',
    status: 'inactive',
    primaryProviderId: '2',
    intakeDate: new Date('2022-09-05'),
    dischargeDate: new Date('2023-06-30'),
    dischargeReason: 'Treatment goals met',
    createdAt: new Date('2022-09-05'),
    updatedAt: new Date('2023-06-30')
  },
  {
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
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    dateOfBirth: new Date('1965-04-30'),
    email: 'david.brown@example.com',
    phone: '(555) 567-8901',
    gender: 'Male',
    pronouns: 'he/him',
    status: 'active',
    primaryProviderId: '3',
    intakeDate: new Date('2022-11-15'),
    flags: ['Billing issue', 'Needs updated insurance'],
    createdAt: new Date('2022-11-15'),
    updatedAt: new Date('2023-09-10')
  },
  {
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
  }
];

const ClientDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'waitlist' | 'discharged' | 'inquiry'>('all');
  const [clientData, setClientData] = useState<Client[]>(mockClientData);
  const [isLoading, setIsLoading] = useState(false);

  // Filter clients based on search term and filters
  const filteredClients = clientData.filter(client => {
    const matchesSearch = 
      searchTerm === '' || 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'waitlist':
        return 'bg-amber-100 text-amber-800';
      case 'discharged':
        return 'bg-blue-100 text-blue-800';
      case 'inquiry':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Client Directory</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Add New Client
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
              placeholder="Search by name, email, or phone..."
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
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="waitlist">Waitlist</option>
              <option value="discharged">Discharged</option>
              <option value="inquiry">Inquiry</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Client list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age/Gender
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flags
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.intakeDate ? `Intake: ${client.intakeDate.toLocaleDateString()}` : 
                           client.referralDate ? `Referred: ${client.referralDate.toLocaleDateString()}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email || 'No email'}</div>
                    <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{calculateAge(client.dateOfBirth)} years</div>
                    <div className="text-sm text-gray-500">{client.gender || 'Not specified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(client.status)}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.flags && client.flags.length > 0 ? (
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm text-gray-500">{client.flags.length} flag{client.flags.length !== 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
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
                  No clients found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDirectory;
