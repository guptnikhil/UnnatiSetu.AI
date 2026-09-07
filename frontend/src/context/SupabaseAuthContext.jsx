/**
 * SupabaseAuthContext — NSFDC Admin Authentication
 *
 * Applicants NEVER log in — this context is used only by the Admin Dashboard.
 * Provides: current admin session, sign-in, sign-out, loading state.
 *
 * The Supabase anon key is safe to expose in the frontend because:
 *   - RLS policies enforce what the anon key can actually access
 *   - The service role key is ONLY in the Python backend
 *
 * After sign-in, the nsfdc_admins table is checked to confirm the user is a
 * registered officer. A valid auth.users account alone is not enough.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase client — anon key only, subject to RLS
// ---------------------------------------------------------------------------
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Returns null (no client) when env vars are missing so the app degrades
// gracefully without Supabase configured
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = Boolean(supabase);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);       // Supabase auth session
  const [adminProfile, setAdminProfile] = useState(null); // row from nsfdc_admins
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On mount: restore existing session and subscribe to auth state changes
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAdminProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAdminProfile(session.user.id);
      else {
        setAdminProfile(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches the admin's profile from nsfdc_admins.
   * If no row exists, the user is not a registered officer — sign them out.
   */
  const fetchAdminProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('nsfdc_admins')
        .select('*')
        .eq('admin_id', userId)
        .single();

      if (error || !data) {
        // Valid auth user but not a registered NSFDC admin
        await supabase.auth.signOut();
        setAuthError('Your account is not registered as an NSFDC officer. Contact your regional administrator.');
        setAdminProfile(null);
      } else {
        setAdminProfile(data);
        setAuthError(null);
      }
    } catch (err) {
      console.error('[Auth] fetchAdminProfile error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Sign in with email + password.
   * Returns { success, error }.
   */
  const signIn = async (email, password) => {
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  /**
   * Send a magic link (passwordless) to the given email.
   */
  const signInWithMagicLink = async (email) => {
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setAdminProfile(null);
    setSession(null);
  };

  return (
    <SupabaseAuthContext.Provider value={{
      session,
      adminProfile,
      isAdmin: Boolean(session && adminProfile),
      authLoading,
      authError,
      setAuthError,
      signIn,
      signInWithMagicLink,
      signOut,
      supabase,
      isSupabaseConfigured,
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export const useAuth = () => useContext(SupabaseAuthContext);
