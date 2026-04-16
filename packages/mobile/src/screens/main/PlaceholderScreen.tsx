import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaceholderScreenProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function PlaceholderScreen({ title, icon }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color="#7C5CFC" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>A venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    color: '#8B8BA7',
    fontSize: 16,
    marginTop: 8,
  },
});
