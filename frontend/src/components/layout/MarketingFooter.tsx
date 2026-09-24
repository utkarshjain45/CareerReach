import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="py-8 border-t border-slate-200/60 bg-white/50 backdrop-blur-md text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <Logo size="sm" />

        <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-xs">
          <Link to="/#simulator" className="hover:text-slate-900 transition-colors">Demo</Link>
          <Link to="/features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
          <Link to="/security" className="hover:text-slate-900 transition-colors">Security</Link>
          <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} CareerReach.
      </div>
    </footer>
  );
};
