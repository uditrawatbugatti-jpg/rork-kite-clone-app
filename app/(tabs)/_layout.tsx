import { Tabs } from "expo-router";
import { Bookmark, BookOpen, Briefcase, Gavel, User } from "lucide-react-native";
import React, { useMemo } from "react";
import { useColorScheme, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(() => {
    const basePaddingBottom = Platform.OS === "ios" ? 12 : 8;
    const paddingBottom = Math.max(insets.bottom, basePaddingBottom);

    const baseHeight = Platform.OS === "ios" ? 56 : 52;
    const height = baseHeight + paddingBottom;

    return {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      height,
      paddingBottom,
      paddingTop: 8,
    } as const;
  }, [colors.background, colors.border, insets.bottom]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle,
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color }) => <Bookmark color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color }) => <Briefcase color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Bids",
          tabBarIcon: ({ color }) => <Gavel color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "DR2598",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
