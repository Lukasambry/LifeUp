import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  level: number;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (user: AuthUser, accessToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('accessToken').then((token) => {
      if (token) setAccessToken(token);
    });
  }, []);

  const login = (u: AuthUser, token: string) => {
    setUser(u);
    setAccessToken(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
