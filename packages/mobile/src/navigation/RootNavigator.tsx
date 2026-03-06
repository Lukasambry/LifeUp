import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';

// MainNavigator will be added here when main app screens are ready
function MainPlaceholder() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>⚔️ LifeUp</Text>
      <Text style={styles.placeholderText}>Connecté en tant que</Text>
      <Text style={styles.placeholderUsername}>{user?.username}</Text>
      <Text style={styles.placeholderEmail}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('hasSeenOnboarding').then((value) => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C5CFC" />
      </View>
    );
  }

  if (user) return <MainPlaceholder />;

  return <AuthNavigator initialRoute={hasSeenOnboarding ? 'Login' : 'Onboarding'} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#8B8BA7',
    fontSize: 14,
  },
  placeholderUsername: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  placeholderEmail: {
    color: '#8B8BA7',
    fontSize: 14,
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#2D2D4E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});
