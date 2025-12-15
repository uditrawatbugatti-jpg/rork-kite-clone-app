import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';

type PlaceholderParams = {
  title?: string;
  subtitle?: string;
};

export default function PlaceholderScreen() {
  const router = useRouter();
  const { title, subtitle } = useLocalSearchParams<PlaceholderParams>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const resolvedTitle = useMemo(() => {
    if (typeof title === 'string' && title.trim().length > 0) return title;
    return 'Coming soon';
  }, [title]);

  const resolvedSubtitle = useMemo(() => {
    if (typeof subtitle === 'string' && subtitle.trim().length > 0) return subtitle;
    return 'This screen is a placeholder. The button is wired correctly.';
  }, [subtitle]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: resolvedTitle,
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
              testID="placeholder-back"
            >
              <ChevronLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content} testID="placeholder-screen">
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{resolvedSubtitle}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                console.log('[Placeholder] Primary pressed', { title, subtitle });
                router.back();
              }}
              activeOpacity={0.85}
              testID="placeholder-primary"
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => {
                console.log('[Placeholder] Secondary pressed', { title, subtitle, platform: Platform.OS });
              }}
              activeOpacity={0.85}
              testID="placeholder-secondary"
            >
              <ExternalLink size={16} color={colors.textSecondary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Log action</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          If you want this screen implemented for real, tell me what it should do.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 19,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 14,
  },
  secondaryButton: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontWeight: '600' as const,
    fontSize: 13,
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 16,
  },
});
