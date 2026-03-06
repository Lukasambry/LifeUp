import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

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
  isLoading: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [token, userStr] = await Promise.all([
          SecureStore.getItemAsync('accessToken'),
          SecureStore.getItemAsync('user'),
        ]);
        if (token) setAccessToken(token);
        if (userStr) setUser(JSON.parse(userStr));
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (u: AuthUser, token: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync('accessToken', token),
      SecureStore.setItemAsync('refreshToken', refreshToken),
      SecureStore.setItemAsync('user', JSON.stringify(u)),
    ]);
    setUser(u);
    setAccessToken(token);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken: token, refreshToken, user: u } = res.data;
      await login(u, token, refreshToken);
    },
    [login],
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const res = await api.post('/auth/register', { email, username, password });
      const { accessToken: token, refreshToken, user: u } = res.data;
      await login(u, token, refreshToken);
    },
    [login],
  );

  const logout = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (refreshToken && accessToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {}
    }
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      SecureStore.deleteItemAsync('user'),
    ]);
    setUser(null);
    setAccessToken(null);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, loginWithEmail, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
