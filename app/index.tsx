import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

/**
 * "/" is the app's single routing authority.
 *
 * On mount it runs the decision ladder once:
 *   1. !hasCompletedOnboarding -> /intro
 *   2. !isAuthenticated        -> /auth
 *   3. !isKycVerified          -> /kyc-details
 *   4. fully verified          -> main app (tabs)
 *
 * All redirects are replace-only so the gate never sits in the history
 * stack; screens that finish a stage navigate back to "/" (replace) to
 * re-run the ladder. This is what prevents redirect loops.
 */
export default function GateScreen() {
  const router = useRouter();
  const { isHydrated, isAuthenticated, hasCompletedOnboarding, isKycVerified } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!hasCompletedOnboarding) {
      router.replace("/intro");
      return;
    }
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    if (!isKycVerified) {
      router.replace("/kyc-details");
      return;
    }
    router.replace("/(tabs)/explore");
  }, [isHydrated, hasCompletedOnboarding, isAuthenticated, isKycVerified, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
