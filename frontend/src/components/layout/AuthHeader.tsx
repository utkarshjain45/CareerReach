import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

interface AuthHeaderProps {
  current: 'login' | 'register';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ current }) => {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs py-3.5 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo - clicking takes user to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-slate-900 group transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-700 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Career<span className="text-brand-600">Reach</span>
          </span>
        </Link>

        {/* Right contextual action */}
        <div className="flex items-center gap-2 text-xs">
          {current === 'login' ? (
            <>
              <span className="text-slate-500 hidden sm:inline">Don&apos;t have an account?</span>
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-500 hidden sm:inline">Already have an account?</span>
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
