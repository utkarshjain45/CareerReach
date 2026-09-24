import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Key,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Plus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { settingsApi } from '../api/settingsApi';
import { gmailApi } from '../api/gmailApi';
import { templateApi } from '../api/templateApi';
import {
  UserSettings,
  GmailConnectionDto,
  EmailTemplate,
} from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'gmail' | 'preferences'>('profile');
  const toast = useToast();
  const oauthHandledRef = useRef<boolean>(false);

  // Profile Form State
  const [profileName, setProfileName] = useState<string>(user?.name || '');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<UserSettings>({
    maxEmailsPerCampaign: 100,
    sendingDelayMs: 2000,
    defaultTemplateId: null,
    socialLinks: [],
  });
  const [newLinkName, setNewLinkName] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [showAddLinkForm, setShowAddLinkForm] = useState<boolean>(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState<boolean>(false);
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);

  // Gmail Status State
  const [gmailStatus, setGmailStatus] = useState<GmailConnectionDto | null>(null);
  const [loadingGmail, setLoadingGmail] = useState<boolean>(false);
  const [connectingGmail, setConnectingGmail] = useState<boolean>(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  // Reset any stuck loading state if page is restored from browser back-forward cache
  useEffect(() => {
    const handlePageShow = () => {
      setConnectingGmail(false);
      setLoadingGmail(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
    loadGmailStatus();
    loadPreferences();
  }, [user]);

  // Handle Google OAuth callback if redirected directly to /settings?code=...
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setActiveTab('gmail');
      setLoadingGmail(false);
      setConnectingGmail(false);
      oauthHandledRef.current = false;
      toast.error(`Google authorization error: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && !oauthHandledRef.current) {
      oauthHandledRef.current = true;
      setActiveTab('gmail');
      setLoadingGmail(true);

      const completeOAuthExchange = async () => {
        try {
          const res = await gmailApi.handleCallback(code, state || undefined);
          if (res.data) {
            setGmailStatus(res.data);
            toast.success(`Successfully connected Gmail (${res.data.googleAccountEmail})!`);
          }
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Failed to complete Google OAuth connection.';
          toast.error(msg);
          oauthHandledRef.current = false;
        } finally {
          setLoadingGmail(false);
          setConnectingGmail(false);
          // Remove query params from address bar so page refresh doesn't re-submit used code
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      completeOAuthExchange();
    }
  }, [searchParams, toast]);

  const loadGmailStatus = async () => {
    setLoadingGmail(true);
    try {
      const res = await gmailApi.getStatus();
      if (res.data) setGmailStatus(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingGmail(false);
    }
  };

  const loadPreferences = async () => {
    setLoadingPrefs(true);
    try {
      const [prefRes, tplRes] = await Promise.all([
        settingsApi.getSettings(),
        templateApi.getTemplates(),
      ]);
      if (prefRes.data) setPreferences(prefRes.data);
      if (tplRes.data) setTemplates(tplRes.data);
    } catch {
      // ignore
    } finally {
      setLoadingPrefs(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      await settingsApi.updateProfile({ name: profileName.trim() });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await settingsApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await settingsApi.updatePreferences(preferences);
      toast.success('Sending preferences saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleAddSocialLink = async () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      toast.error('Please enter both platform name and URL');
      return;
    }
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const newLink = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: newLinkName.trim(),
      url: url,
    };
    const updated = [...(preferences.socialLinks || []), newLink];
    const updatedPrefs = { ...preferences, socialLinks: updated };
    setPreferences(updatedPrefs);
    setNewLinkName('');
    setNewLinkUrl('');
    setShowAddLinkForm(false);

    try {
      await settingsApi.updatePreferences(updatedPrefs);
      toast.success(`Saved '${newLink.name}' to profile links`);
    } catch {
      toast.error('Failed to save profile link');
    }
  };

  const handleDeleteSocialLink = async (index: number) => {
    const updated = (preferences.socialLinks || []).filter((_, idx) => idx !== index);
    const updatedPrefs = { ...preferences, socialLinks: updated };
    setPreferences(updatedPrefs);
    try {
      await settingsApi.updatePreferences(updatedPrefs);
      toast.success('Removed link');
    } catch {
      toast.error('Failed to delete link');
    }
  };

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const res = await gmailApi.getAuthUrl();
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        toast.error('Failed to obtain Google authorization URL');
        setConnectingGmail(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize Google OAuth');
      setConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    setDisconnecting(true);
    try {
      await gmailApi.disconnect();
      toast.success('Gmail account disconnected');
      setDisconnectConfirmOpen(false);
      loadGmailStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disconnect Gmail');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure your profile, security credentials, and Gmail sending preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4 text-brand-600" /> Profile &amp; Security
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'gmail'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-coral-500" /> Gmail Integration
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-600" /> Sending Preferences
        </button>
      </div>

      {/* TAB 1: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="glass-panel rounded-3xl p-8 shadow-card border border-white/80 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-card">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Update Display Name
              </h4>
              <div className="flex items-center gap-3 max-w-md">
                <Input
                  placeholder="Your Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full"
                />
                <Button variant="primary" size="sm" type="submit" loading={savingProfile}>
                  Save
                </Button>
              </div>
            </form>
          </div>

          {/* Candidate Profile & Social Links Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span>Candidate Profile & Social Links</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add your GitHub, LeetCode, portfolio, LinkedIn, and other links. These can be inserted directly or dynamically (e.g. {'{{github}}'}) into your outreach templates.
                </p>
              </div>
              {!showAddLinkForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddLinkForm(true)}
                  className="shrink-0 text-brand-600 border-brand-200 hover:bg-brand-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Link
                </Button>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Add:</span>
              {[
                { name: 'GitHub', placeholder: 'https://github.com/username' },
                { name: 'LeetCode', placeholder: 'https://leetcode.com/u/username' },
                { name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                { name: 'Portfolio', placeholder: 'https://yourportfolio.dev' },
                { name: 'Codeforces', placeholder: 'https://codeforces.com/profile/username' },
                { name: 'Twitter / X', placeholder: 'https://x.com/username' },
              ].map((preset) => {
                const alreadyAdded = (preferences.socialLinks || []).some(
                  (l) => l.name.toLowerCase() === preset.name.toLowerCase()
                );
                return (
                  <button
                    key={preset.name}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      setNewLinkName(preset.name);
                      if (!newLinkUrl) setNewLinkUrl(preset.placeholder);
                      setShowAddLinkForm(true);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${alreadyAdded
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 cursor-pointer'
                      }`}
                  >
                    + {preset.name}
                  </button>
                );
              })}
            </div>

            {/* Inline Add Link Form */}
            {showAddLinkForm && (
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-brand-700">
                    Add New Profile Link
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLinkForm(false);
                      setNewLinkName('');
                      setNewLinkUrl('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Platform Name (e.g. GitHub, LeetCode)"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                  />
                  <Input
                    placeholder="URL (e.g. https://github.com/johndoe)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddLinkForm(false);
                      setNewLinkName('');
                      setNewLinkUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddSocialLink}
                  >
                    Save Link
                  </Button>
                </div>
              </div>
            )}

            {/* Links List */}
            {(!preferences.socialLinks || preferences.socialLinks.length === 0) ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                No profile or social links added yet. Add your GitHub, LeetCode, or Portfolio above to easily include them in your cold outreach emails!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {preferences.socialLinks.map((link, idx) => {
                  const variableTag = `{{${link.name.toLowerCase().replace(/[^a-z0-9_]/g, '')}}}`;
                  return (
                    <div
                      key={link.id || idx}
                      className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-brand-200 hover:shadow-xs transition-all"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {link.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {variableTag}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline truncate flex items-center gap-1 mt-0.5"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSocialLink(idx)}
                        className="opacity-60 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-5">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-600" />
              <span>Change Password</span>
            </h4>
            <p className="text-xs text-slate-500">
              Update your account password. Password must be at least 6 characters long.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password *"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Input
                label="New Password *"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Input
                label="Confirm New Password *"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              />

              <Button variant="primary" size="sm" type="submit" loading={changingPassword}>
                Update Password
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Gmail Integration */}
      {activeTab === 'gmail' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600" />
                <span>Connected Google Account</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official Google OAuth 2.0 integration for sending personalized recruitment messages
              </p>
            </div>

            {loadingGmail ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 animate-pulse flex items-center gap-1.5">
                Checking...
              </span>
            ) : gmailStatus?.connected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Not Connected
              </span>
            )}
          </div>

          {gmailStatus?.connected ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Sender Address</span>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {gmailStatus.googleAccountEmail}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectGmail}
                    loading={connectingGmail}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Reconnect
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDisconnectConfirmOpen(true)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No Gmail account is connected to this profile. Connect your Gmail to authorize sending outreach campaigns.
              </p>
              <Button variant="primary" size="sm" onClick={handleConnectGmail} loading={connectingGmail} icon={<Mail className="w-4 h-4" />}>
                Connect Gmail Account
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sending Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Outreach &amp; Rate-Limiting Preferences</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure safe delivery rate limits and default outreach settings
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Maximum Emails per Campaign
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={preferences.maxEmailsPerCampaign}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxEmailsPerCampaign: parseInt(e.target.value) || 100 })
                }
                className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:ring-brand-500 focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Recommended limit to protect sender score (1–500)
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Delay Between Emails (Milliseconds)
              </label>
              <input
                type="number"
                min={1000}
                max={30000}
                step={500}
                value={preferences.sendingDelayMs}
                onChange={(e) =>
                  setPreferences({ ...preferences, sendingDelayMs: parseInt(e.target.value) || 2000 })
                }
                className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:ring-brand-500 focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Delay plus random jitter applied between recipient dispatches (e.g. 2000ms = 2s)
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Outreach Template
              </label>
              <select
                value={preferences.defaultTemplateId || ''}
                onChange={(e) =>
                  setPreferences({ ...preferences, defaultTemplateId: e.target.value || null })
                }
                className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">— No Default Template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="primary" size="sm" type="submit" loading={savingPrefs || loadingPrefs}>
              Save Preferences
            </Button>
          </form>
        </div>
      )}

      {/* Disconnect Gmail Confirmation Dialog */}
      <ConfirmDialog
        isOpen={disconnectConfirmOpen}
        onClose={() => setDisconnectConfirmOpen(false)}
        onConfirm={handleDisconnectGmail}
        title="Disconnect Gmail Account"
        message="Are you sure you want to disconnect your Gmail account? Any active campaigns will be paused."
        loading={disconnecting}
      />
    </div>
  );
};
