import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

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

  if (user) return <MainNavigator />;

  return <AuthNavigator initialRoute={hasSeenOnboarding ? 'Login' : 'Onboarding'} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
