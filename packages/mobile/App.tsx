import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useGoogleSignIn } from './src/hooks/useGoogleSignIn';
import { useAppleSignIn } from './src/hooks/useAppleSignIn';

function LoginScreen() {
  const { login, user, logout } = useAuth();

  const { request, promptAsync } = useGoogleSignIn(({ user: u, accessToken }) => {
    login(u, accessToken);
  });

  const { signIn: signInWithApple } = useAppleSignIn(({ user: u, accessToken }) => {
    login(u, accessToken);
  });

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <Text style={styles.meta}>@{user.username} · Niveau {user.level}</Text>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeUp</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton, !request && styles.disabled]}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>Se connecter avec Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={signInWithApple}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  meta: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: 280,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  logoutButton: {
    backgroundColor: '#888',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    width: 280,
    height: 44,
  },
});
