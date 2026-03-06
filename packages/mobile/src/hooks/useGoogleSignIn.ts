import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  level: number;
  avatarUrl?: string | null;
}

interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function useGoogleSignIn(onSuccess: (result: AuthResult) => void) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const promptAsync = useCallback(async () => {
    const sessionId = Crypto.randomUUID();
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/auth/google/status/${sessionId}`);
        if (res.data.status === 'complete') {
          stopPolling();
          WebBrowser.dismissBrowser();
          const { accessToken, refreshToken, user } = res.data;
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
          onSuccess({ user, accessToken, refreshToken });
        }
      } catch {
        // backend not reachable yet, keep polling
      }
    }, 2000);

    await WebBrowser.openBrowserAsync(
      `${apiUrl}/auth/google/mobile?sessionId=${sessionId}`,
    );

    // Browser closed (user dismissed or we dismissed it)
    stopPolling();
  }, [onSuccess]);

  return { promptAsync };
}
