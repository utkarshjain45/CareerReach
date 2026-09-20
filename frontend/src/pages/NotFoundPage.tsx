import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Brand Icon */}
      <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-6 shadow-xs">
        <Mail className="w-6 h-6" />
      </div>

      <span className="text-xs font-mono font-bold text-brand-600 tracking-wider uppercase mb-2">
        404 Error
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        Page not found
      </h1>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={<LayoutDashboard className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" icon={<Home className="w-4 h-4" />}>
            Go Home
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-xs text-slate-400">
        CareerReach &bull; Smarter outreach. Better opportunities.
      </div>
    </div>
  );
};
