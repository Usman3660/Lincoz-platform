import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  Sun,
  Moon,
  Info
} from 'lucide-react';

export const AuthPage = ({ onNavigateToLanding, onLoginSuccess }) => {
  const { users, setCurrentUserId, pushNotification, theme, toggleTheme } = useApp();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Check if entered email requires two-factor verification
  const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  const requiresMfa = matchedUser?.isMfaEnabled || matchedUser?.role === 'SUPER_ADMIN';

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setAuthError('Please enter your email address.');
      return;
    }

    const targetUser = users.find(u => u.email.toLowerCase() === targetEmail);
    
    if (!targetUser) {
      setAuthError('Invalid credentials. Contact your Project Manager or Super Admin if your account is not yet provisioned.');
      return;
    }

    if (requiresMfa && (!mfaCode || mfaCode.trim().length < 4)) {
      setAuthError('Two-factor authentication code is required.');
      return;
    }

    setCurrentUserId(targetUser.id);
    pushNotification(
      'Authenticated Successfully',
      `Signed in as ${targetUser.name}.`,
      'success'
    );
    onLoginSuccess(targetUser);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#182234] hover:bg-[#202d44] border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              LINCOZ
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleUp">
          
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Workspace Access
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Sign In to Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Enter your enterprise credentials to access your scoped operational dashboard.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lincoz.internal"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Two-Factor Verification Code (When applicable) */}
            {requiresMfa && (
              <div className="p-3.5 rounded-xl bg-[#182234] border border-indigo-500/30 space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Two-Factor Verification Code
                </label>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="6-digit auth code"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-4 h-4" /> Sign In to Workspace
            </button>
          </form>

          {/* Provisioning Notice */}
          <div className="p-3.5 rounded-2xl bg-[#182234]/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Provisioned Accounts Only:</strong> Public registration is disabled. Super Admin provisions Project Managers, and Project Managers provision onsite members & partner contractors.
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500">
        Lincoz Enterprise &bull; Secure Authentication Gateway
      </footer>

    </div>
  );
};
