// template
import { MarketProvider } from "@/context/MarketContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PaytmMoneyConfigProvider } from "@/context/PaytmMoneyConfigContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LockScreen from "@/components/LockScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const queryClient = new QueryClient();

function AppContent() {
  const { isUnlocked } = useAuth();

  if (!isUnlocked) {
    return <LockScreen />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="stock-detail" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="order-ticket" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="placeholder" options={{ headerShown: true, title: "" }} />
    </Stack>
  );
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <PaytmMoneyConfigProvider>
        <MarketProvider>
          <AppContent />
        </MarketProvider>
      </PaytmMoneyConfigProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>

        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
