import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={64} color="#7C5CFC" />
      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.level}>Niveau {user?.level}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    color: '#8B8BA7',
    fontSize: 14,
  },
  level: {
    color: '#7C5CFC',
    fontSize: 16,
    fontWeight: '600',
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
