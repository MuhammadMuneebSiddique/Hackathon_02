'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useSession } from '@/util/better-auth-client'

const BetterAuthContext = createContext();

export function BetterAuthProvider({ children }) {
  const { data: session, isLoading, mutate } = useSession;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  const value = {
    session: session,
    user: session?.user,
    loading: isLoading || !initialized,
    isAuthenticated: !!session?.user,
    mutateSession: mutate,
    initialized

  };

  return (
    <BetterAuthContext.Provider value={value}>
      {children}
    </BetterAuthContext.Provider>
  );
}

export function useBetterAuth() {
  const context = useContext(BetterAuthContext);
  if (!context) {
    throw new Error('useBetterAuth must be used within a BetterAuthProvider');
  }
  return context;
}