import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { TasksScreen } from '../screens/main/TasksScreen';
import { SocialScreen } from '../screens/main/SocialScreen';
import { LeaderboardScreen } from '../screens/main/LeaderboardScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Social: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

const TAB_CONFIG: {
  name: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  component: React.ComponentType;
}[] = [
  { name: 'Dashboard', label: 'Accueil', icon: 'home-outline', iconFocused: 'home', component: DashboardScreen },
  { name: 'Tasks', label: 'Taches', icon: 'list-outline', iconFocused: 'list', component: TasksScreen },
  { name: 'Social', label: 'Social', icon: 'people-outline', iconFocused: 'people', component: SocialScreen },
  { name: 'Leaderboard', label: 'Classement', icon: 'trophy-outline', iconFocused: 'trophy', component: LeaderboardScreen },
  { name: 'Profile', label: 'Profil', icon: 'person-outline', iconFocused: 'person', component: ProfileScreen },
];

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C5CFC',
        tabBarInactiveTintColor: '#8B8BA7',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2D2D4E',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
