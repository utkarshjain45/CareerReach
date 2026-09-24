import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AuthHeader } from '../components/layout/AuthHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back to CareerReach!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
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

      <AuthHeader current="login" />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Header text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Sign in to manage your contacts, templates, and Gmail outreach campaigns
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-panel py-8 px-6 sm:px-8 rounded-3xl shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                label="Work / Personal Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
                required
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
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
                Create free account
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
