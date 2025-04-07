import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, FileText, MessageSquare, 
  DollarSign, CheckSquare, BarChart2, Settings, 
  Plus, X, ChevronDown, Edit, Maximize2, Minimize2
} from 'lucide-react';
import { DashboardWidget } from '../../models/DashboardWidget';
import { DashboardPreference } from '../../models/DashboardPreference';
import { DashboardMetric } from '../../models/DashboardMetric';
import { DashboardAlert } from '../../models/DashboardAlert';

// Mock dashboard widgets
const mockDashboardWidgets: DashboardWidget[] = [
  {
    id: '1',
    name: 'Upcoming Appointments',
    type: 'appointments',
    description: 'Shows your upcoming appointments for today and tomorrow',
    icon: 'Calendar',
    availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor'],
    defaultSize: 'medium',
    refreshInterval: 300,
    settings: {
      showCancelled: false,
      daysToShow: 2
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Recent Clients',
    type: 'clients',
    description: 'Shows recently viewed or updated clients',
    icon: 'Users',
    availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor', 'biller'],
    defaultSize: 'medium',
    refreshInterval: 600,
    settings: {
      limit: 5,
      sortBy: 'lastViewed'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '3',
    name: 'Documentation Due',
    type: 'notes',
    description: 'Shows notes that are due or overdue',
    icon: 'FileText',
    availableForRoles: ['admin', 'clinician', 'supervisor'],
    defaultSize: 'medium',
    refreshInterval: 900,
    settings: {
      showOverdueOnly: false,
      daysToShow: 7
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '4',
    name: 'Unread Messages',
    type: 'messages',
    description: 'Shows unread messages and notifications',
    icon: 'MessageSquare',
    availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor', 'biller'],
    defaultSize: 'small',
    refreshInterval: 60,
    settings: {
      groupByThread: true,
      showNotifications: true
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '5',
    name: 'Billing Summary',
    type: 'billing',
    description: 'Shows billing and payment summary',
    icon: 'DollarSign',
    availableForRoles: ['admin', 'biller', 'supervisor'],
    defaultSize: 'medium',
    refreshInterval: 1800,
    settings: {
      timeRange: 'month',
      showUnpaid: true
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '6',
    name: 'Tasks',
    type: 'tasks',
    description: 'Shows your pending and upcoming tasks',
    icon: 'CheckSquare',
    availableForRoles: ['admin', 'clinician', 'scheduler', 'supervisor', 'biller'],
    defaultSize: 'small',
    refreshInterval: 300,
    settings: {
      showCompleted: false,
      sortBy: 'dueDate'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '7',
    name: 'Performance Metrics',
    type: 'metrics',
    description: 'Shows key performance indicators',
    icon: 'BarChart2',
    availableForRoles: ['admin', 'supervisor'],
    defaultSize: 'large',
    refreshInterval: 3600,
    settings: {
      timeRange: 'month',
      metrics: ['appointments', 'revenue', 'utilization']
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '8',
    name: 'System Status',
    type: 'custom',
    description: 'Shows system status and notifications',
    icon: 'Settings',
    availableForRoles: ['admin'],
    defaultSize: 'small',
    refreshInterval: 300,
    settings: {
      showMaintenance: true,
      showUpdates: true
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

// Mock dashboard alerts
const mockDashboardAlerts: DashboardAlert[] = [
  {
    id: '1',
    title: 'Documentation Overdue',
    message: 'You have 3 notes that are overdue for completion.',
    type: 'warning',
    priority: 'high',
    isRead: false,
    isDismissed: false,
    targetRoles: ['clinician', 'supervisor'],
    relatedEntityType: 'note',
    actionUrl: '/documentation',
    actionText: 'View Notes',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15')
  },
  {
    id: '2',
    title: 'New Messages',
    message: 'You have 2 unread messages from clients.',
    type: 'info',
    priority: 'medium',
    isRead: false,
    isDismissed: false,
    targetRoles: ['clinician', 'admin', 'supervisor'],
    relatedEntityType: 'client',
    actionUrl: '/messages',
    actionText: 'View Messages',
    createdAt: new Date('2023-11-16'),
    updatedAt: new Date('2023-11-16')
  },
  {
    id: '3',
    title: 'Insurance Verification Required',
    message: '5 clients need insurance verification before their next appointment.',
    type: 'warning',
    priority: 'medium',
    isRead: false,
    isDismissed: false,
    targetRoles: ['biller', 'admin'],
    relatedEntityType: 'billing',
    actionUrl: '/billing/insurance',
    actionText: 'Verify Insurance',
    createdAt: new Date('2023-11-14'),
    updatedAt: new Date('2023-11-14')
  }
];

// Mock metrics data
const mockMetricsData = {
  appointments: {
    total: 120,
    completed: 95,
    cancelled: 15,
    noShow: 10,
    utilization: 0.85
  },
  clients: {
    active: 85,
    inactive: 30,
    waitlist: 12,
    newThisMonth: 8
  },
  billing: {
    revenue: 15250.75,
    outstanding: 4320.50,
    insurancePending: 8750.25,
    collectionsRate: 0.92
  },
  documentation: {
    completed: 110,
    pending: 15,
    overdue: 5,
    completionRate: 0.88
  }
};

// Mock upcoming appointments
const mockUpcomingAppointments = [
  {
    id: '1',
    clientName: 'John Smith',
    date: new Date(new Date().setHours(new Date().getHours() + 2)),
    duration: 60,
    type: 'Individual Therapy',
    status: 'confirmed'
  },
  {
    id: '2',
    clientName: 'Emily Johnson',
    date: new Date(new Date().setHours(new Date().getHours() + 4)),
    duration: 45,
    type: 'Initial Assessment',
    status: 'confirmed'
  },
  {
    id: '3',
    clientName: 'Michael Williams',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 60,
    type: 'Individual Therapy',
    status: 'pending'
  }
];

// Mock recent clients
const mockRecentClients = [
  {
    id: '1',
    name: 'John Smith',
    lastSeen: new Date(new Date().setDate(new Date().getDate() - 2)),
    nextAppointment: new Date(new Date().setHours(new Date().getHours() + 2)),
    status: 'active'
  },
  {
    id: '2',
    name: 'Emily Johnson',
    lastSeen: new Date(new Date().setDate(new Date().getDate() - 5)),
    nextAppointment: new Date(new Date().setHours(new Date().getHours() + 4)),
    status: 'active'
  },
  {
    id: '5',
    name: 'David Brown',
    lastSeen: new Date(new Date().setDate(new Date().getDate() - 10)),
    nextAppointment: new Date(new Date().setDate(new Date().getDate() + 3)),
    status: 'active'
  }
];

// Mock documentation due
const mockDocumentationDue = [
  {
    id: '1',
    clientName: 'John Smith',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: 'Progress Note',
    status: 'pending'
  },
  {
    id: '2',
    clientName: 'Emily Johnson',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 4)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    type: 'Progress Note',
    status: 'overdue'
  },
  {
    id: '3',
    clientName: 'Michael Williams',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    type: 'Assessment',
    status: 'overdue'
  }
];

// Mock unread messages
const mockUnreadMessages = [
  {
    id: '1',
    sender: 'John Smith',
    subject: 'Question about appointment',
    date: new Date(new Date().setHours(new Date().getHours() - 3)),
    preview: 'Hi, I was wondering if we could reschedule my...'
  },
  {
    id: '2',
    sender: 'System Notification',
    subject: 'Documentation Reminder',
    date: new Date(new Date().setHours(new Date().getHours() - 5)),
    preview: 'This is a reminder that you have documentation due...'
  }
];

// Mock tasks
const mockTasks = [
  {
    id: '1',
    title: 'Call insurance for authorization',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    priority: 'high',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Complete intake paperwork for new client',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    priority: 'medium',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Review supervision notes',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    priority: 'low',
    status: 'pending'
  }
];

interface DashboardProps {
  userRole: 'admin' | 'clinician' | 'scheduler' | 'biller' | 'supervisor';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter widgets based on user role
        const availableWidgets = mockDashboardWidgets.filter(widget => 
          widget.availableForRoles.includes(userRole)
        );
        setWidgets(availableWidgets);
        
        // Filter alerts based on user role
        const relevantAlerts = mockDashboardAlerts.filter(alert => 
          alert.targetRoles.includes(userRole) && !alert.isDismissed
        );
        setAlerts(relevantAlerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Calendar':
        return <Calendar className="h-5 w-5" />;
      case 'Users':
        return <Users className="h-5 w-5" />;
      case 'FileText':
        return <FileText className="h-5 w-5" />;
      case 'MessageSquare':
        return <MessageSquare className="h-5 w-5" />;
      case 'DollarSign':
        return <DollarSign className="h-5 w-5" />;
      case 'CheckSquare':
        return <CheckSquare className="h-5 w-5" />;
      case 'BarChart2':
        return <BarChart2 className="h-5 w-5" />;
      case 'Settings':
        return <Settings className="h-5 w-5" />;
      default:
        return <div className="h-5 w-5" />;
    }
  };

  const renderWidgetContent = (widget: DashboardWidget) => {
    switch(widget.type) {
      case 'appointments':
        return (
          <div className="space-y-3">
            {mockUpcomingAppointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{appointment.clientName}</p>
                  <p className="text-xs text-gray-500">{appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Appointments
            </button>
          </div>
        );
      
      case 'clients':
        return (
          <div className="space-y-3">
            {mockRecentClients.map(client => (
              <div key={client.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">
                    Last seen: {client.lastSeen.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Clients
            </button>
          </div>
        );
      
      case 'notes':
        return (
          <div className="space-y-3">
            {mockDocumentationDue.map(doc => (
              <div key={doc.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.clientName}</p>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                  <p className="text-xs text-gray-500">
                    Due: {doc.dueDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Documentation
            </button>
          </div>
        );
      
      case 'messages':
        return (
          <div className="space-y-3">
            {mockUnreadMessages.map(message => (
              <div key={message.id} className="border-b border-gray-100 pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{message.sender}</p>
                  <p className="text-xs text-gray-500">
                    {message.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-xs text-gray-500 truncate">{message.subject}</p>
                <p className="text-xs text-gray-400 truncate">{message.preview}</p>
              </div>
            ))}
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Messages
            </button>
          </div>
        );
      
      case 'billing':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Revenue (MTD)</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${mockMetricsData.billing.revenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${mockMetricsData.billing.outstanding.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Insurance Pending</p>
              <p className="text-sm font-medium text-gray-900">
                ${mockMetricsData.billing.insurancePending.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${mockMetricsData.billing.collectionsRate * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Collections Rate: {(mockMetricsData.billing.collectionsRate * 100).toFixed(1)}%
              </p>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View Billing Dashboard
            </button>
          </div>
        );
      
      case 'tasks':
        return (
          <div className="space-y-3">
            {mockTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due: {task.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Tasks
            </button>
          </div>
        );
      
      case 'metrics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Appointments (MTD)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockMetricsData.appointments.total}
                </p>
                <p className="text-xs text-gray-500">
                  {mockMetricsData.appointments.completed} completed ({(mockMetricsData.appointments.utilization * 100).toFixed(1)}% utilization)
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Active Clients</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockMetricsData.clients.active}
                </p>
                <p className="text-xs text-gray-500">
                  {mockMetricsData.clients.newThisMonth} new this month
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Documentation</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockMetricsData.documentation.completed}
                </p>
                <p className="text-xs text-gray-500">
                  {mockMetricsData.documentation.overdue} overdue
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Waitlist</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockMetricsData.clients.waitlist}
                </p>
                <p className="text-xs text-gray-500">
                  Clients waiting for services
                </p>
              </div>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View Detailed Reports
            </button>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Widget content not available</p>
          </div>
        );
    }
  };

  const getWidgetSize = (size: string) => {
    switch(size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'admin' ? 'Admin Dashboard' :
           userRole === 'clinician' ? 'Clinician Dashboard' :
           userRole === 'scheduler' ? 'Scheduler Dashboard' :
           userRole === 'biller' ? 'Billing Dashboard' :
           'Supervisor Dashboard'}
        </h1>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isCustomizing ? 'Done' : 'Customize Dashboard'}
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`rounded-lg p-4 ${
                alert.type === 'warning' ? 'bg-yellow-50' :
                alert.type === 'error' ? 'bg-red-50' :
                alert.type === 'success' ? 'bg-green-50' :
                'bg-blue-50'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'warning' && (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  )}
                  {alert.type === 'error' && (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                  {alert.type === 'success' && (
                    <CheckSquare className="h-5 w-5 text-green-400" />
                  )}
                  {alert.type === 'info' && (
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    alert.type === 'warning' ? 'text-yellow-800' :
                    alert.type === 'error' ? 'text-red-800' :
                    alert.type === 'success' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {alert.title}
                  </h3>
                  <div className={`mt-1 text-sm ${
                    alert.type === 'warning' ? 'text-yellow-700' :
                    alert.type === 'error' ? 'text-red-700' :
                    alert.type === 'success' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    <p>{alert.message}</p>
                  </div>
                  {alert.actionUrl && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          alert.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                          alert.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {alert.actionText}
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => dismissAlert(alert.id)}
                      className={`inline-flex rounded-md p-1.5 ${
                        alert.type === 'warning' ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100' :
                        alert.type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100' :
                        alert.type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100' :
                        'bg-blue-50 text-blue-500 hover:bg-blue-100'
                      }`}
                    >
                      <span className="sr-only">Dismiss</span>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {widgets.map(widget => (
          <div 
            key={widget.id}
            className={`${getWidgetSize(widget.defaultSize)} ${
              isCustomizing ? 'border-2 border-dashed border-gray-300 bg-gray-50' : 'bg-white'
            } rounded-lg shadow-sm overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    widget.type === 'appointments' ? 'bg-indigo-100 text-indigo-600' :
                    widget.type === 'clients' ? 'bg-purple-100 text-purple-600' :
                    widget.type === 'notes' ? 'bg-blue-100 text-blue-600' :
                    widget.type === 'messages' ? 'bg-green-100 text-green-600' :
                    widget.type === 'billing' ? 'bg-yellow-100 text-yellow-600' :
                    widget.type === 'tasks' ? 'bg-red-100 text-red-600' :
                    widget.type === 'metrics' ? 'bg-teal-100 text-teal-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getIconComponent(widget.icon)}
                  </div>
                  <h3 className="ml-2 text-lg font-medium text-gray-900">{widget.name}</h3>
                </div>
                {isCustomizing ? (
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-500">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-500">
                      {widget.defaultSize === 'small' ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button className="p-1 text-gray-400 hover:text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {!isCustomizing && (
                <div className="mt-2">
                  {renderWidgetContent(widget)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isCustomizing && (
          <div className="col-span-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Add Widget</h3>
            <p className="mt-1 text-xs text-gray-500">Click to add a new widget to your dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
