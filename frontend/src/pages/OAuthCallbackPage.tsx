import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gmailApi } from '../api/gmailApi';
import { useToast } from '../context/ToastContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(true);
  const hasExecutedRef = useRef(false);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state') || undefined;
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Google authorization was declined or returned an error: ${errorParam}`);
      setProcessing(false);
      return;
    }

    if (!code) {
      setError('No authorization code was found in the callback request.');
      setProcessing(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await gmailApi.handleCallback(code, state);
        if (res.data) {
          toast.success(`Connected to Gmail (${res.data.googleAccountEmail})!`);
          navigate('/gmail-connect', { replace: true });
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to complete Google OAuth authorization.';
        setError(msg);
        toast.error(msg);
      } finally {
        setProcessing(false);
      }
    };

    exchangeCode();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full">
        {processing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-brand-50 text-brand-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Connecting your Gmail account...</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exchanging Google authorization credentials and encrypting your access token at rest.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Connection Failed</h3>
            <p className="text-xs text-rose-600 leading-relaxed font-medium bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              {error}
            </p>
            <Button variant="primary" onClick={() => navigate('/gmail-connect')}>
              Back to Gmail Connection
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gmail Connected!</h3>
            <p className="text-xs text-slate-500">Redirecting to your workspace...</p>
          </div>
        )}
      </div>
    </div>
  );
};
