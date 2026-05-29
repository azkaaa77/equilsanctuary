'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  mounted: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  manualSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const initializeAuth = async () => {
    try {
      console.log('AuthProvider: [Sync] Starting sanctuary synchronization...');
      
      // [DELAY PROTOCOL] 
      // If hash token detected, wait for SDK to ingest before checking session
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        console.log('AuthProvider: [Protocol] Token hash detected. Waiting 1500ms for SDK processing...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (currentSession) {
        console.log('AuthProvider: [Sync Complete] Session synchronized:', currentSession.user.email);
        console.log('Sanctuary Ready: ', true);
        setSession(currentSession);
        setUser(currentSession.user);
        setIsLoading(false);
      } else {
        console.log('AuthProvider: [Sync] No active session found.');
        console.log('Sanctuary Ready: ', false);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('AuthProvider: [Sync Critical Failure] ', err);
      setIsLoading(false);
    }
  };

  const manualSync = async () => {
    console.log('AuthProvider: [Action] Manual sync triggered by user.');
    setIsLoading(true);
    
    try {
      // Direct session fetch
      const { data: { session: manualSession } } = await supabase.auth.getSession();
      if (manualSession) {
        setSession(manualSession);
        setUser(manualSession.user);
      } else {
        // Force refresh if nothing found
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        if (refreshedSession) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        }
      }
    } catch (e) {
      console.error('AuthProvider: Manual sync error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // [Mounted State Guard]
    setTimeout(() => setMounted(true), 0);
    console.log('AuthProvider: [Status] Component mounted.');
    
    setTimeout(() => initializeAuth(), 0);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthProvider: [Event] Auth state change:', event);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsLoading(false);
        
        // [ON-BOARDING REDIRECT]
        // Only redirect automatically if we have a fresh auth hash (callback from Google)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          console.log('AuthProvider: [Redirect] Auth hash detected. Routing to Dashboard...');
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsLoading(false);
        router.push('/');
      }

      // Cleanup URL hash after processing
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    // FAIL-SAFE: Force-break loading state if stuck
    const stuckFallback = setTimeout(async () => {
      if (isLoading) {
        console.warn('AuthProvider: [Timeout] Sync taking too long. Forcing session verification...');
        try {
          const { data: { user: forcedUser } } = await supabase.auth.getUser();
          if (forcedUser) {
            setUser(forcedUser);
            const { data: { session: forcedSession } } = await supabase.auth.getSession();
            setSession(forcedSession);
          }
        } catch (e) {
          console.error('AuthProvider: Timeout sync failed:', e);
        } finally {
          setIsLoading(false);
        }
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(stuckFallback);
    };
  }, [router, isLoading]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    console.log('AuthProvider: [Action] Launching Google Login with fixed redirect context...');
    
    // STRICT REDIRECT TARGET
    const REDIRECT_URL = 'http://localhost:3000/dashboard';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('AuthProvider: Login failure:', error.message);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.refresh();
    router.push('/');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, mounted, signInWithGoogle, signOut, manualSync }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
