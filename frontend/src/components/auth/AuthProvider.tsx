'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState } from '@/types/auth';
import { getMe } from '@/lib/auth';

interface AuthContextType extends AuthState {
  refreshUser: () => Promise<void>;
  logoutClient: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const refreshUser = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await getMe();
      if (response.success && response.data?.user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: response.data.user,
        });
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const logoutClient = () => {
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  // Initial fetch on mount
  useEffect(() => {
    // Timeout avoids synchronous setState warning from linter
    setTimeout(() => {
      refreshUser();
    }, 0);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, logoutClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
