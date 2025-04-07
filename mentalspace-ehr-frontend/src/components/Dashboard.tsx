import React from 'react';
import { Calendar, FileText, MessageSquare, User } from 'lucide-react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  text: string;
  color: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, text, color, onClick }) => {
  return (
    <button
      className={`${color} text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{text}</span>
    </button>
  );
};

interface DashboardCardProps {
  title: string;
  viewAllText: string;
  colorAccent: string;
  children: React.ReactNode;
  onViewAll?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  viewAllText, 
  colorAccent, 
  children,
  onViewAll 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className={`${colorAccent} h-2`}></div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={onViewAll}
          >
            {viewAllText}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // Mock data
  const upcomingAppointments = [
    { id: 1, client: 'Sarah Johnson', time: '10:00 AM', type: 'Individual' },
    { id: 2, client: 'David Chen', time: '11:30 AM', type: 'Initial Assessment' },
    { id: 3, client: 'Maria Garcia', time: '1:15 PM', type: 'Couples' },
    { id: 4, client: 'James Wilson', time: '3:00 PM', type: 'Individual' }
  ];
  
  const pendingNotes = [
    { id: 1, client: 'Emily Davis', date: 'Apr 5, 2025', type: 'Progress Note' },
    { id: 2, client: 'Michael Brown', date: 'Apr 5, 2025', type: 'Treatment Plan' },
    { id: 3, client: 'Olivia Smith', date: 'Apr 4, 2025', type: 'Progress Note' }
  ];
  
  const clientMessages = [
    { id: 1, client: 'Thomas Lee', preview: 'I need to reschedule my appointment on...', time: '9:23 AM' },
    { id: 2, client: 'Jennifer Taylor', preview: 'Thank you for sending those resources...', time: 'Yesterday' }
  ];

  return (
    <>
      {/* Quick actions */}
      <div className="flex space-x-4 mb-6">
        <QuickActionButton
          icon={<User size={20} />}
          text="New Client"
          color="bg-blue-500 hover:bg-blue-600"
        />
        <QuickActionButton
          icon={<Calendar size={20} />}
          text="New Appointment"
          color="bg-purple-500 hover:bg-purple-600"
        />
        <QuickActionButton
          icon={<FileText size={20} />}
          text="New Note"
          color="bg-teal-500 hover:bg-teal-600"
        />
        <QuickActionButton
          icon={<MessageSquare size={20} />}
          text="Send Message"
          color="bg-amber-500 hover:bg-amber-600"
        />
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <DashboardCard
          title="Today's Appointments"
          viewAllText="View Calendar"
          colorAccent="bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <div className="space-y-4">
            {upcomingAppointments.map(appt => (
              <div key={appt.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-800">{appt.client}</p>
                  <p className="text-xs text-gray-500">{appt.type}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {appt.time}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        {/* Notes requiring attention */}
        <DashboardCard
          title="Unsigned Notes"
          viewAllText="View All Notes"
          colorAccent="bg-gradient-to-r from-amber-500 to-orange-600"
        >
          <div className="space-y-4">
            {pendingNotes.map(note => (
              <div key={note.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-800">{note.client}</p>
                  <p className="text-xs text-gray-500">{note.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {note.date}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        {/* Recent messages */}
        <DashboardCard
          title="Recent Messages"
          viewAllText="Go to Inbox"
          colorAccent="bg-gradient-to-r from-teal-500 to-green-500"
        >
          <div className="space-y-4">
            {clientMessages.map(message => (
              <div key={message.id} className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">{message.client}</p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{message.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        {/* Weekly summary */}
        <DashboardCard
          title="Weekly Summary"
          viewAllText="View Reports"
          colorAccent="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Appointments</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="ml-2 text-sm text-green-500 flex items-center">
                  <span className="flex items-center">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-1 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                    </svg>
                    <span className="ml-1">+8%</span>
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Notes Completed</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">18</p>
                <p className="ml-2 text-sm text-green-500 flex items-center">
                  <span className="flex items-center">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-1 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                    </svg>
                    <span className="ml-1">+12%</span>
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Billing</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">$3,240</p>
                <p className="ml-2 text-sm text-red-500 flex items-center">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-1 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                    </svg>
                    <span className="ml-1">-3%</span>
                  </span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">New Clients</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="ml-2 text-sm text-green-500 flex items-center">
                  <span className="flex items-center">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-1 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                    </svg>
                    <span className="ml-1">+25%</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </>
  );
};

export default Dashboard;
