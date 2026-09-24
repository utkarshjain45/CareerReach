import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';

interface AuthHeaderProps {
  current: 'login' | 'register';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ current }) => {
  return (
    <header className="w-full bg-[#FBFBFA]/80 backdrop-blur-md py-4 px-6 sm:px-10 border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo - clicking takes user to home */}
        <Logo size="md" />

        {/* Right contextual action */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          {current === 'login' ? (
            <>
              <span className="text-slate-500 hidden sm:inline">Don&apos;t have an account?</span>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-500 hidden sm:inline">Already have an account?</span>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
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
