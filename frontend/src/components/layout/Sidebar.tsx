import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  Mail,
  Paperclip,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Contacts', path: '/contacts', icon: Users, badge: null },
    { name: 'Templates', path: '/templates', icon: FileText, badge: null },
    { name: 'Attachments', path: '/attachments', icon: Paperclip, badge: null },
    { name: 'Campaigns', path: '/campaigns', icon: Send, badge: null },
    { name: 'Gmail Connect', path: '/gmail-connect', icon: Mail, badge: null },
    { name: 'Settings', path: '/settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-slate-100 flex flex-col justify-between transition-all duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="flex items-center justify-between h-20 px-6">
            <Logo size="lg" subtitle="Smart Outreach" to="/dashboard" />
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-50/90 text-brand-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 text-inherit shrink-0 transition-transform group-hover:scale-110 duration-200" />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand-100 text-brand-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/50 border border-slate-100/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                {user?.name || 'Recruiter Pro'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
