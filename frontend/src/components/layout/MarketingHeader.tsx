import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface MarketingHeaderProps {
  activePage?: 'home' | 'features' | 'how-it-works' | 'security';
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({ activePage = 'home' }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="sticky top-4 sm:top-6 z-50 px-4 sm:px-6 w-full max-w-6xl mx-auto mb-8 sm:mb-12">
      <header className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-soft">
        <Logo size="md" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <Link
            to="/#simulator"
            className="hover:text-slate-900 transition-colors"
          >
            Live Demo
          </Link>
          <Link
            to="/features"
            className={`transition-colors ${
              activePage === 'features' ? 'text-brand-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Features
          </Link>
          <Link
            to="/how-it-works"
            className={`transition-colors ${
              activePage === 'how-it-works' ? 'text-brand-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/security"
            className={`transition-colors ${
              activePage === 'security' ? 'text-brand-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Security
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  pill
                  icon={<LayoutDashboard className="w-3.5 h-3.5" />}
                >
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={logout}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-rose-50"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button
                  variant="coral"
                  size="sm"
                  pill
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
};
