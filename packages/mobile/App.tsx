import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// Update prefixes with your production domain when available
// e.g. ['lifeup://', 'https://lifeup.app']
const linking = {
  prefixes: ['lifeup://'],
  config: {
    screens: {
      ResetPassword: {
        path: 'reset-password', // lifeup://reset-password?token=abc123
      },
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
