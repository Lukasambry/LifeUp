import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  level: number;
}

interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
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

      const res = await api.post('/auth/apple', {
        identityToken,
        firstName: fullName?.givenName,
        lastName: fullName?.familyName,
      });

      const { accessToken, refreshToken, user } = res.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      onSuccess({ user, accessToken, refreshToken });
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        console.error('useAppleSignIn error:', err);
      }
    }
  };

  return { signIn };
}
