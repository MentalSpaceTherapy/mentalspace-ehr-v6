import React from 'react';
import { 
  Bell, Calendar, ChevronDown, Clock, CreditCard, 
  FileText, Home, MessageSquare, Settings, User, Users
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <li>
      <button
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          active ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-700/50'
        }`}
        onClick={onClick}
      >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{text}</span>
      </button>
    </li>
  );
};

interface SidebarProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSidebarItem, setActiveSidebarItem }) => {
  return (
    <div className="w-64 bg-indigo-800 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold">MentalSpace</h1>
        <p className="text-indigo-300 text-sm">Electronic Health Records</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          <SidebarItem 
            icon={<Home size={20} />} 
            text="Dashboard" 
            active={activeSidebarItem === 'dashboard'} 
            onClick={() => setActiveSidebarItem('dashboard')}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            text="Clients" 
            active={activeSidebarItem === 'clients'} 
            onClick={() => setActiveSidebarItem('clients')}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            text="Documentation" 
            active={activeSidebarItem === 'documentation'} 
            onClick={() => setActiveSidebarItem('documentation')}
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            text="Schedule" 
            active={activeSidebarItem === 'schedule'} 
            onClick={() => setActiveSidebarItem('schedule')}
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            text="Messaging" 
            active={activeSidebarItem === 'messaging'} 
            onClick={() => setActiveSidebarItem('messaging')}
          />
          <SidebarItem 
            icon={<CreditCard size={20} />} 
            text="Billing" 
            active={activeSidebarItem === 'billing'} 
            onClick={() => setActiveSidebarItem('billing')}
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            text="Settings" 
            active={activeSidebarItem === 'settings'} 
            onClick={() => setActiveSidebarItem('settings')}
          />
        </ul>
      </nav>
      
      {/* User profile */}
      <div className="px-4 py-4 border-t border-indigo-700">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full">
            <span className="text-lg font-medium">DR</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Dr. Rebecca Johnson</p>
            <p className="text-xs text-indigo-300">Clinical Psychologist</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
