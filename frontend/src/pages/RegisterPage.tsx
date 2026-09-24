import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthHeader } from '../components/layout/AuthHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      toast.success('Registration successful! Welcome to CareerReach.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="ambient-glow w-[450px] h-[450px] bg-brand-200/50 -top-20 -left-20" />
      <div className="ambient-glow w-[400px] h-[400px] bg-coral-200/40 -bottom-20 -right-20" />

      <AuthHeader current="register" />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Header text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create Free Workspace
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Start personalizing and scaling your recruiter cold outreach in minutes
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-panel py-8 px-6 sm:px-8 rounded-3xl shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{apiError}</span>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="Sarah Connor"
                icon={<UserIcon className="w-4 h-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />

              <Input
                label="Work / Personal Email"
                type="email"
                autoComplete="email"
                placeholder="sarah@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <Input
                label="Password (min. 6 characters)"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="coral"
                  size="md"
                  pill
                  loading={loading}
                  className="w-full text-sm font-bold"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100 z-10">
        © {new Date().getFullYear()} CareerReach. Smarter outreach. Better opportunities.
      </footer>
    </div>
  );
};
