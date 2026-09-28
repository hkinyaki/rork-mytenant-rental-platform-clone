import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import TenantDashboard from "@/components/dashboard/TenantDashboard";
import LandlordDashboard from "@/components/dashboard/LandlordDashboard";

/**
 * Dashboard container.
 *
 * Owns the tRPC query (keyed on activeMode, so switching role view refetches),
 * loading/error states and the stack header. All role-specific UI lives in
 * components/dashboard/TenantDashboard and LandlordDashboard.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { user, activeMode } = useAuth();

  const dashboardQuery = trpc.dashboard.get.useQuery({
    userId: user?.id || "user-1",
    role: activeMode,
  });

  if (dashboardQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Dashboard",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Dashboard",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
          <Text style={styles.errorText}>
            {dashboardQuery.error?.message || "Something went wrong"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dashboardQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const data = dashboardQuery.data;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: activeMode === "landlord" ? "Landlord Dashboard" : "Tenant Dashboard",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* data.role mirrors activeMode: the query input above passes
            role: activeMode, so the payload discriminator stays in sync. */}
        {data.role === "tenant" ? (
          <TenantDashboard
            data={data}
            onPayNow={() => router.push("/payments" as any)}
          />
        ) : (
          <LandlordDashboard data={data} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
});
