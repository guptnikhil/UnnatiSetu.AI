/**
 * AdminLogin — NSFDC Officer Sign-in Screen
 *
 * Supports two modes:
 *   1. Email + password (default)
 *   2. Magic link (passwordless) — toggle with "Use Magic Link"
 *
 * Applicants never see this screen — it renders only when
 * mode === 'admin' and no Supabase session exists.
 *
 * When Supabase is not configured, shows a clear "demo mode" notice
 * instead of a broken login form.
 */
import React, { useState } from 'react';
import { useAuth, isSupabaseConfigured } from '../../context/SupabaseAuthContext';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, LogIn, Mail, KeyRound, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, signInWithMagicLink, authError, setAuthError } = useAuth();
  const { theme } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    if (useMagicLink) {
      const result = await signInWithMagicLink(email);
      if (result.success) setMagicLinkSent(true);
    } else {
      await signIn(email, password);
    }

    setLoading(false);
  };

  const baseCard = `rounded-2xl p-8 border shadow-2xl w-full max-w-md mx-auto ${
    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
  }`;

  // ── Supabase not configured ──────────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={baseCard}>
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            <div>
              <h2 className={`text-xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                NSFDC Admin — Demo Mode
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Supabase not connected</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 border mb-5 ${
            theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-800/40'
          }`}>
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Supabase environment variables are not set. The admin dashboard is running in
                offline demo mode with synthetic data.
                <br /><br />
                To enable real auth, add <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">frontend/.env</code> file.
              </span>
            </div>
          </div>

          {/* In demo mode, allow bypass to view the dashboard */}
          <a href="#demo-bypass" onClick={(e) => { e.preventDefault(); window.location.reload(); }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all">
            <Sparkles className="w-4 h-4" />
            View Demo Dashboard (No Auth)
          </a>
        </div>
      </div>
    );
  }

  // ── Magic link sent ──────────────────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={baseCard}>
          <div className="text-center">
            <Mail className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Check your email
            </h2>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              A sign-in link has been sent to <strong>{email}</strong>.
              Click the link in the email to access the NSFDC Admin Dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Login form ───────────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={baseCard}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-7 h-7 text-amber-500" />
          <div>
            <h2 className={`text-xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              NSFDC Officer Sign-in
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorised personnel only
            </p>
          </div>
        </div>

        {/* Error banner */}
        {authError && (
          <div className={`rounded-xl p-3 mb-5 text-sm border flex items-start gap-2 ${
            theme === 'light'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-rose-900/20 border-rose-800/40 text-rose-400'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="officer@nsfdc.in"
                className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Password (only for email+password mode) */}
          {!useMagicLink && (
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{useMagicLink ? 'Send Magic Link' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle magic link */}
        <div className="mt-5 text-center">
          <button
            onClick={() => { setUseMagicLink(!useMagicLink); setAuthError(null); }}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            {useMagicLink ? '← Use password instead' : 'Use Magic Link (passwordless) →'}
          </button>
        </div>

        <p className={`text-center text-[10px] mt-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
          Applicants do not need to log in. This portal is for NSFDC officers only.
        </p>
      </div>
    </div>
  );
}
