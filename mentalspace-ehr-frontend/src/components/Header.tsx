import React from 'react';
import { Bell, Clock } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const notificationCount = 4; // This would come from a real notification system
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-4">
          <button className="p-2 relative" aria-label="Notifications">
            <Bell className="h-6 w-6 text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                {notificationCount}
              </span>
            )}
          </button>
          <div className="h-8 w-px bg-gray-200"></div>
          <button className="text-sm text-gray-700 flex items-center">
            Today: {currentDate}
            <Clock className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
