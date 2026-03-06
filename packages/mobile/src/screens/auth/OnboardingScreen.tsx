import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width } = Dimensions.get('window');

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

const SLIDES = [
  {
    id: '1',
    emoji: '⚔️',
    title: 'Gamifie ta vie',
    description: 'Transforme tes tâches quotidiennes en quêtes épiques. Gagne de l\'XP, monte de niveau et deviens le héros de ta propre histoire.',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Développe tes stats',
    description: 'Force, Intelligence, Agilité, Endurance, Charisme, Sagesse — chaque habitude renforce une statistique et forge ton personnage.',
  },
  {
    id: '3',
    emoji: '🏆',
    title: 'Défie tes amis',
    description: 'Rejoins des guildes, lance des défis, remporte des achievements. La progression est plus fun quand elle se partage.',
  },
];

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const finishOnboarding = () => {
    SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  skip: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    color: '#8B8BA7',
    fontSize: 14,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#8B8BA7',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D2D4E',
  },
  dotActive: {
    backgroundColor: '#7C5CFC',
    width: 24,
  },
  button: {
    backgroundColor: '#7C5CFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
