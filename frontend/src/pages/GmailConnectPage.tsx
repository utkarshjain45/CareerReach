import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { gmailApi } from '../api/gmailApi';
import { GmailConnectionDto } from '../types';
import { useToast } from '../context/ToastContext';

export const GmailConnectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oauthHandledRef = useRef<boolean>(false);
  const [connection, setConnection] = useState<GmailConnectionDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  const toast = useToast();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await gmailApi.getStatus();
      if (res.data) {
        setConnection(res.data);
      }
    } catch {
      toast.error('Failed to load Gmail connection status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const handlePageShow = () => {
      setConnecting(false);
      setLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Handle Google OAuth callback if redirected to /gmail-connect?code=...
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Google authorization error: ${error}`);
      setConnecting(false);
      setLoading(false);
      oauthHandledRef.current = false;
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && !oauthHandledRef.current) {
      oauthHandledRef.current = true;
      setLoading(true);

      const completeOAuthExchange = async () => {
        try {
          const res = await gmailApi.handleCallback(code, state || undefined);
          if (res.data) {
            setConnection(res.data);
            toast.success(`Successfully connected Gmail (${res.data.googleAccountEmail})!`);
          }
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Failed to connect Gmail account';
          toast.error(msg);
          oauthHandledRef.current = false;
        } finally {
          setLoading(false);
          setConnecting(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      completeOAuthExchange();
    }
  }, [searchParams, toast]);

  const handleConnectGmail = async () => {
    setConnecting(true);
    try {
      const res = await gmailApi.getAuthUrl();
      if (res.data?.authUrl) {
        // Redirect browser to Google's official OAuth consent screen
        window.location.href = res.data.authUrl;
      } else {
        toast.error('Could not initiate Google OAuth flow.');
        setConnecting(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not initiate Google OAuth flow.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await gmailApi.disconnect();
      toast.success('Gmail account disconnected');
      setDisconnectDialogOpen(false);
      fetchStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gmail Connection</h2>
          <p className="text-xs text-slate-500 mt-1">
            Connect your personal Gmail or Google Workspace account via OAuth 2.0 to dispatch recruitment outreach
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          loading={loading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Status
        </Button>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-xs text-slate-400 font-medium">Checking Gmail authorization status...</p>
          </div>
        ) : connection?.connected ? (
          /* CONNECTED STATE */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                    <span className="text-xs text-slate-400">
                      via Google OAuth 2.0
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                    {connection.googleAccountEmail}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized on{' '}
                    {connection.connectedAt
                      ? new Date(connection.connectedAt).toLocaleDateString()
                      : 'Recent'}
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                size="md"
                onClick={() => setDisconnectDialogOpen(true)}
                icon={<LogOut className="w-4 h-4" />}
              >
                Disconnect Gmail
              </Button>
            </div>

            {/* Token Expiry or Warning alert if applicable */}
            {connection.tokenExpired && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
                <div className="flex items-center gap-2.5 font-medium">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Your Gmail authorization token requires re-authorization.</span>
                </div>
                <Button variant="primary" size="sm" onClick={handleConnectGmail} loading={connecting}>
                  Reconnect Gmail
                </Button>
              </div>
            )}

            {/* Account Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold text-xs block mb-1">Sending Identity</span>
                <span className="font-semibold text-slate-800 text-sm">{connection.googleAccountEmail}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold text-xs block mb-1">Credential Security</span>
                <span className="font-semibold text-emerald-700 text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" /> AES-256 Encrypted at Rest
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* DISCONNECTED STATE */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs shrink-0">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Not Connected
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                    Connect your Gmail Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your Gmail account to send personalized outreach campaigns with CareerReach.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleConnectGmail}
                loading={connecting}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Connect Gmail
              </Button>
            </div>

            <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-2xl text-xs text-brand-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Zero Password Storage Guarantee
              </p>
              <p>
                You will authorize directly through Google&apos;s official consent screen. We never see,
                ask for, or store your Google password or app passwords.
              </p>
            </div>
          </div>
        )}

        {/* Security & Scopes Information */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Security Architecture &amp; Scopes
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 mb-1">
                <Lock className="w-3.5 h-3.5 text-brand-600" />
                <span>gmail.send</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Allows sending candidate recruitment emails directly through your connected Gmail mailbox.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>userinfo.email</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verifies the sender email address to properly set the <code>From:</code> header.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multi-Tenant Vault</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                OAuth access tokens and refresh tokens are encrypted at rest using AES-256-GCM.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={disconnectDialogOpen}
        onClose={() => setDisconnectDialogOpen(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Gmail Account"
        message={`Are you sure you want to disconnect ${connection?.googleAccountEmail}? Any running campaigns will be paused until a Gmail account is reconnected.`}
        confirmText="Disconnect"
        variant="danger"
        loading={disconnecting}
      />
    </div>
  );
};
