import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  level: number;
}

interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

export function useAppleSignIn(onSuccess: (result: AuthResult) => void) {
  const signIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, fullName } = credential;
      if (!identityToken) throw new Error('No identity token from Apple');

      const res = await fetch(`${API_URL}/auth/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken,
          firstName: fullName?.givenName,
          lastName: fullName?.familyName,
        }),
      });

      if (!res.ok) throw new Error(`Apple auth failed: ${res.status}`);
      const data: { accessToken: string; refreshToken: string; user: AuthUser } = await res.json();

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      onSuccess({ user: data.user, accessToken: data.accessToken });
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        console.error('useAppleSignIn error:', err);
      }
    }
  };

  return { signIn };
}
