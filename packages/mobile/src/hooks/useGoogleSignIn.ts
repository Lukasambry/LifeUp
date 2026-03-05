import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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
}

export function useGoogleSignIn(onSuccess: (result: AuthResult) => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      console.error('useGoogleSignIn: no idToken in authentication response');
      return;
    }

    fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Google auth failed: ${res.status}`);
        return res.json();
      })
      .then(async (data: { accessToken: string; refreshToken: string; user: AuthUser }) => {
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        onSuccess({ user: data.user, accessToken: data.accessToken });
      })
      .catch((err) => console.error('useGoogleSignIn error:', err));
  }, [response]);

  return { request, promptAsync };
}
