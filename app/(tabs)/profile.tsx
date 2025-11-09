import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  User as UserIcon,
  Settings,
  Heart,
  LayoutDashboard,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Calendar,
  Wallet,
  Wrench,
  RefreshCw,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, triggerAuth, switchRole, isSwitchingRole } = useAuth();
  const [currentRole, setCurrentRole] = useState<"tenant" | "landlord">("tenant");

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout },
      ]
    );
  };

  const handleRoleSwitch = async () => {
    const newRole = currentRole === "tenant" ? "landlord" : "tenant";
    await switchRole(newRole);
    setCurrentRole(newRole);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.authPrompt}>
          <UserIcon size={64} color={Colors.primary} />
          <Text style={styles.authTitle}>Welcome to MyTenant</Text>
          <Text style={styles.authSubtitle}>
            Sign in to access your profile and manage your properties
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => triggerAuth("profile")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.hostButton}
            onPress={() => triggerAuth("host")}
          >
            <Text style={styles.hostButtonText}>Become a Landlord</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      icon: Heart,
      title: "Wishlists",
      subtitle: "Saved properties",
      onPress: () => router.push("/(tabs)/wishlists"),
    },
    {
      icon: CreditCard,
      title: "Payments",
      subtitle: "Payment methods & history",
      onPress: () => router.push("/payments" as any),
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Alerts & reminders",
      onPress: () => router.push("/notifications" as any),
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: "Account preferences",
      onPress: () => router.push("/settings" as any),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "FAQ & contact us",
      onPress: () => router.push("/support" as any),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: user?.photo || "https://i.pravatar.cc/150?img=33" }}
              style={styles.profileImage}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.rating && (
                <View style={styles.ratingContainer}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.rating}>{user.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingDot}>•</Text>
                  <Text style={styles.reviewCount}>
                    {user.reviewCount} {user.reviewCount === 1 ? "review" : "reviews"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {user?.role === "both" && (
            <TouchableOpacity
              style={styles.roleSwitchButton}
              onPress={handleRoleSwitch}
              disabled={isSwitchingRole}
              activeScale={0.98}
            >
              {isSwitchingRole ? (
                <View style={styles.roleSwitchLoading}>
                  <ActivityIndicator size="small" color={Colors.background} />
                  <Text style={styles.roleSwitchButtonText}>
                    Switching to {currentRole === "tenant" ? "Landlord" : "Tenant"}...
                  </Text>
                </View>
              ) : (
                <View style={styles.roleSwitchContent}>
                  <RefreshCw size={18} color={Colors.background} />
                  <Text style={styles.roleSwitchButtonText}>
                    {currentRole === "tenant" ? "Switch to Landlord" : "Return to Tenant"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {user?.role === "tenant" && (
            <TouchableOpacity
              style={styles.hostBanner}
              onPress={() => router.push("/host-onboarding" as any)}
            >
              <View style={styles.hostBannerContent}>
                <Text style={styles.hostBannerTitle}>Become a Landlord</Text>
                <Text style={styles.hostBannerText}>
                  List your property and earn income
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Overview</Text>
          <View style={styles.summaryGrid}>
            <TouchableOpacity style={styles.summaryCard} onPress={() => console.log("View Dashboard")}>
              <View style={styles.summaryIconContainer}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <Text style={styles.summaryLabel}>Rent Due</Text>
              <Text style={styles.summaryValue}>3 days</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.summaryCard} onPress={() => console.log("View Wallet")}>
              <View style={styles.summaryIconContainer}>
                <Wallet size={20} color={Colors.success} />
              </View>
              <Text style={styles.summaryLabel}>Wallet</Text>
              <Text style={styles.summaryValue}>TZS 250K</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.summaryCard} onPress={() => console.log("View Maintenance")}>
              <View style={styles.summaryIconContainer}>
                <Wrench size={20} color={Colors.warning} />
              </View>
              <Text style={styles.summaryLabel}>Maintenance</Text>
              <Text style={styles.summaryValue}>1 active</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.viewDashboardButton} onPress={() => router.push("/dashboard" as any)}>
            <LayoutDashboard size={18} color={Colors.background} />
            <Text style={styles.viewDashboardButtonText}>View Full Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <item.icon size={22} color={Colors.text} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MyTenant v1.0.0</Text>
          <Text style={styles.footerText}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "web" ? spacing.md : 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rating: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
  },
  ratingDot: {
    fontSize: typography.small.fontSize,
    color: Colors.textLight,
  },
  reviewCount: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.text,
  },
  roleSwitchButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleSwitchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  roleSwitchLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  roleSwitchButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.background,
    textAlign: "center" as const,
  },
  hostBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  hostBannerContent: {
    flex: 1,
  },
  hostBannerTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.primary,
    marginBottom: 2,
  },
  hostBannerText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  menuSection: {
    backgroundColor: Colors.background,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.error,
  },
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  authTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  authButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    width: "100%",
    maxWidth: 300,
  },
  authButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    textAlign: "center",
  },
  hostButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    width: "100%",
    maxWidth: 300,
  },
  hostButtonText: {
    color: Colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    textAlign: "center",
  },
  summarySection: {
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  summarySectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  viewDashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  viewDashboardButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.background,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginVertical: 2,
  },
});
