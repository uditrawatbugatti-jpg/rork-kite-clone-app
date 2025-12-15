import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';
import { useColorScheme } from 'react-native';

export default function ToolsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tools' }} />
    </Stack>
  );
}
