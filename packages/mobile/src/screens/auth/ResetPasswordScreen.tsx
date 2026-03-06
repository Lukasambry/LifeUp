import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const token = route.params?.token ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!password) {
      setError('Saisis un nouveau mot de passe.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch {
      setError('Lien invalide ou expiré. Demande un nouveau lien.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.title}>Mot de passe réinitialisé !</Text>
        <Text style={styles.subtitle}>Tu peux maintenant te connecter avec ton nouveau mot de passe.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.emoji}>🔑</Text>
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <Text style={styles.subtitle}>{"Choisis un mot de passe sécurisé d'au moins 8 caractères."}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe"
        placeholderTextColor="#8B8BA7"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#8B8BA7"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={handleReset}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Réinitialiser</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  successEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8BA7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    backgroundColor: '#2D1A1A',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1C1C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2D2D4E',
  },
  button: {
    backgroundColor: '#7C5CFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
