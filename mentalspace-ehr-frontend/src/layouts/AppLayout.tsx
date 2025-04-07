import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AppLayout: React.FC = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Update active sidebar item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/app/dashboard')) {
      setActiveSidebarItem('dashboard');
    } else if (path.includes('/app/clients')) {
      setActiveSidebarItem('clients');
    } else if (path.includes('/app/documentation')) {
      setActiveSidebarItem('documentation');
    } else if (path.includes('/app/schedule')) {
      setActiveSidebarItem('schedule');
    } else if (path.includes('/app/messaging')) {
      setActiveSidebarItem('messaging');
    } else if (path.includes('/app/billing')) {
      setActiveSidebarItem('billing');
    } else if (path.includes('/app/settings')) {
      setActiveSidebarItem('settings');
    }
  }, [location.pathname]);

  // Handle sidebar item click
  const handleSidebarItemClick = (item: string) => {
    setActiveSidebarItem(item);
    
    // Navigate to the corresponding route
    switch (item) {
      case 'dashboard':
        navigate('/app');
        break;
      case 'clients':
        navigate('/app/clients');
        break;
      case 'documentation':
        navigate('/app/documentation');
        break;
      case 'schedule':
        navigate('/app/schedule');
        break;
      case 'messaging':
        navigate('/app/messaging');
        break;
      case 'billing':
        navigate('/app/billing');
        break;
      case 'settings':
        navigate('/app/settings');
        break;
      default:
        navigate('/app');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeSidebarItem={activeSidebarItem} 
        setActiveSidebarItem={handleSidebarItemClick} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <Header title={activeSidebarItem.charAt(0).toUpperCase() + activeSidebarItem.slice(1)} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
