import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Calendar,
  Wallet,
  Home,
  Users,
  Wrench,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentRole] = useState<"tenant" | "landlord">(
    (user?.role === "both" ? "tenant" : user?.role) as "tenant" | "landlord"
  );

  const dashboardQuery = trpc.dashboard.get.useQuery({
    userId: user?.id || "user-1",
    role: currentRole,
  });



  const formatCurrency = (amount: number, currency: string = "TZS") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
          title: "Dashboard",
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
        {data.role === "tenant" ? (
          <View style={styles.dashboardContent}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardLarge]}>
                <View style={styles.statIconContainer}>
                  <Calendar size={24} color={Colors.warning} />
                </View>
                <Text style={styles.statLabel}>Rent Due</Text>
                <Text style={styles.statValue}>
                  {data.stats.rentDue.daysUntilDue} days
                </Text>
                <Text style={styles.statSubtext}>
                  {formatCurrency(data.stats.rentDue.amount, data.stats.currency)}
                </Text>
                <TouchableOpacity style={styles.statAction}>
                  <Text style={styles.statActionText}>Pay Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Wallet size={24} color={Colors.success} />
                </View>
                <Text style={styles.statLabel}>Wallet</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(data.stats.walletBalance, data.stats.currency)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Wrench size={24} color={Colors.primary} />
                </View>
                <Text style={styles.statLabel}>Maintenance</Text>
                <Text style={styles.statValue}>{data.stats.maintenanceActive} active</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Bookings</Text>
              {data.recentBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <Image
                    source={{ uri: booking.propertyPhoto }}
                    style={styles.bookingImage}
                    contentFit="cover"
                  />
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingTitle}>{booking.propertyTitle}</Text>
                    <Text style={styles.bookingDetail}>
                      Next Payment: {formatDate(booking.nextPaymentDate)}
                    </Text>
                    <Text style={styles.bookingAmount}>
                      {formatCurrency(booking.monthlyAmount, "TZS")} / month
                    </Text>
                  </View>
                  <View style={styles.bookingStatus}>
                    <CheckCircle size={20} color={Colors.success} />
                  </View>
                </View>
              ))}
            </View>

            {data.maintenanceTickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Maintenance Requests</Text>
                {data.maintenanceTickets.map((ticket) => (
                  <View key={ticket.id} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketTitle}>{ticket.propertyTitle}</Text>
                      <View
                        style={[
                          styles.ticketStatusBadge,
                          ticket.status === "in_progress" && styles.ticketStatusInProgress,
                        ]}
                      >
                        <Text style={styles.ticketStatusText}>{ticket.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.ticketDescription}>{ticket.description}</Text>
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketMetaText}>
                        Priority: {ticket.priority}
                      </Text>
                      <Text style={styles.ticketMetaText}>
                        {formatDate(ticket.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.dashboardContent}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardLarge]}>
                <View style={styles.statIconContainer}>
                  <TrendingUp size={24} color={Colors.success} />
                </View>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(data.stats.monthlyRevenue, data.stats.currency)}
                </Text>
                <Text style={styles.statSubtext}>
                  Total: {formatCurrency(data.stats.totalRevenue, data.stats.currency)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Home size={24} color={Colors.primary} />
                </View>
                <Text style={styles.statLabel}>Properties</Text>
                <Text style={styles.statValue}>{data.stats.activeProperties}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Users size={24} color={Colors.primary} />
                </View>
                <Text style={styles.statLabel}>Tenants</Text>
                <Text style={styles.statValue}>{data.stats.activeTenants}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Properties</Text>
              {data.properties.map((property) => (
                <View key={property.id} style={styles.propertyCard}>
                  <Image
                    source={{ uri: property.photo }}
                    style={styles.propertyImage}
                    contentFit="cover"
                  />
                  <View style={styles.propertyInfo}>
                    <Text style={styles.propertyTitle}>{property.title}</Text>
                    <Text style={styles.propertyDetail}>
                      Occupancy: {property.occupancyRate}%
                    </Text>
                    <Text style={styles.propertyRevenue}>
                      {formatCurrency(property.monthlyRevenue, "TZS")} / month
                    </Text>
                  </View>
                  <View style={styles.propertyStatus}>
                    <View
                      style={[
                        styles.propertyStatusDot,
                        property.status === "occupied" && styles.propertyStatusOccupied,
                      ]}
                    />
                    <Text style={styles.propertyStatusText}>
                      {property.activeTenants} tenant{property.activeTenants !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {data.recentApplications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Applications</Text>
                {data.recentApplications.map((application) => (
                  <View key={application.id} style={styles.applicationCard}>
                    <Image
                      source={{ uri: application.tenantPhoto }}
                      style={styles.applicationPhoto}
                      contentFit="cover"
                    />
                    <View style={styles.applicationInfo}>
                      <Text style={styles.applicationName}>{application.tenantName}</Text>
                      <Text style={styles.applicationProperty}>
                        {application.propertyTitle}
                      </Text>
                      <Text style={styles.applicationDate}>
                        Applied {formatDate(application.submittedAt)}
                      </Text>
                    </View>
                    <View style={styles.applicationActions}>
                      <TouchableOpacity style={styles.applicationApprove}>
                        <CheckCircle size={20} color={Colors.success} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
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
  dashboardContent: {
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flex: 1,
    minWidth: "48%",
  },
  statCardLarge: {
    minWidth: "100%",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
  statAction: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.sm,
    alignItems: "center",
  },
  statActionText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.background,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  bookingCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  bookingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 4,
  },
  bookingDetail: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bookingAmount: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.primary,
  },
  bookingStatus: {
    marginLeft: spacing.sm,
  },
  ticketCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  ticketTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    flex: 1,
  },
  ticketStatusBadge: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketStatusInProgress: {
    backgroundColor: Colors.primary,
  },
  ticketStatusText: {
    fontSize: typography.caption.fontSize,
    color: Colors.background,
    textTransform: "capitalize",
  },
  ticketDescription: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  ticketMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketMetaText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    textTransform: "capitalize",
  },
  propertyCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 4,
  },
  propertyDetail: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  propertyRevenue: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.success,
  },
  propertyStatus: {
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  propertyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    marginBottom: 4,
  },
  propertyStatusOccupied: {
    backgroundColor: Colors.success,
  },
  propertyStatusText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  applicationCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  applicationPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  applicationProperty: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
  applicationActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  applicationApprove: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
  },
});
