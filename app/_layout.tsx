import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExploreProvider } from "@/contexts/ExploreContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const { showAuthModal } = useAuth();

  useEffect(() => {
    if (showAuthModal) {
      router.push("/auth");
    }
  }, [showAuthModal]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="intro" options={{ headerShown: false }} />
      <Stack.Screen name="kyc-details" options={{ headerShown: false }} />
      <Stack.Screen name="kyc-id-upload" options={{ headerShown: false }} />
      <Stack.Screen name="kyc-face-verify" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="maintenance" options={{ title: "Maintenance" }} />
      <Stack.Screen name="utility-bills" options={{ title: "Utility Bills" }} />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tenants" options={{ title: "Tenant Directory" }} />
      <Stack.Screen name="financials" options={{ title: "Financial Overview" }} />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="host-onboarding" 
        options={{ 
          presentation: "modal",
          headerTitle: "Become a Host",
        }} 
      />
      <Stack.Screen 
        name="booking/[id]" 
        options={{ 
          presentation: "modal",
          headerTitle: "Book Property",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <ExploreProvider>
              <RootLayoutNav />
            </ExploreProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
