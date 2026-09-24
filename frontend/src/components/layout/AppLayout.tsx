import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF9F6] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-coral-500 flex items-center justify-center shadow-card animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Opening CareerReach...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Overview';
      case '/contacts':
        return 'Contacts';
      case '/templates':
        return 'Email Templates';
      case '/attachments':
        return 'Resume & Attachments';
      case '/campaigns':
        return 'Campaigns';
      case '/gmail-connect':
        return 'Gmail Connection';
      case '/settings':
        return 'Settings';
      default:
        return 'CareerReach';
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} title={getPageTitle()} />

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
