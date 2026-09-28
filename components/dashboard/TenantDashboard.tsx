import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Calendar, Wallet, Wrench, CheckCircle, Droplets, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { formatCurrency, formatDate } from "@/components/dashboard/format";
import type { inferRouterOutputs } from "@trpc/server/unstable-core-do-not-import";
import type { AppRouter } from "@/backend/trpc/app-router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type TenantDashboardData = Extract<
  RouterOutputs["dashboard"]["get"],
  { role: "tenant" }
>;

interface TenantDashboardProps {
  data: TenantDashboardData;
  onPayNow: () => void;
}

/**
 * Tenant-specific dashboard content: rent due, wallet, maintenance stats,
 * active bookings, maintenance tickets and utility bills.
 */
export default function TenantDashboard({ data, onPayNow }: TenantDashboardProps) {
  const router = useRouter();

  return (
    <View style={styles.dashboardContent}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardLarge]}>
          <View style={styles.statIconContainer}>
            <Calendar size={24} color={Colors.warning} />
          </View>
          <Text style={styles.statLabel}>Rent Due</Text>
          <Text style={styles.statValue}>{data.stats.rentDue.daysUntilDue} days</Text>
          <Text style={styles.statSubtext}>
            {formatCurrency(data.stats.rentDue.amount, data.stats.currency)} •{" "}
            {data.stats.rentDue.propertyTitle}
          </Text>
          <TouchableOpacity style={styles.statAction} onPress={onPayNow}>
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
            <Image source={{ uri: booking.propertyPhoto }} style={styles.bookingImage} contentFit="cover" />
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>{booking.propertyTitle}</Text>
              <Text style={styles.bookingDetail}>Next Payment: {formatDate(booking.nextPaymentDate)}</Text>
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
                <Text style={styles.ticketMetaText}>Priority: {ticket.priority}</Text>
                <Text style={styles.ticketMetaText}>{formatDate(ticket.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Maintenance & bills entry */}
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push("/maintenance" as any)}
      >
        <Wrench size={20} color={Colors.primary} />
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle}>Maintenance Requests</Text>
          <Text style={styles.linkSubtitle}>
            Raise issues, attach photos, track progress
          </Text>
        </View>
        <ChevronRight size={18} color={Colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push("/utility-bills" as any)}
      >
        <Droplets size={20} color={Colors.primary} />
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle}>Utility Bills</Text>
          <Text style={styles.linkSubtitle}>Track and pay water, power & internet</Text>
        </View>
        <ChevronRight size={18} color={Colors.textLight} />
      </TouchableOpacity>

      {data.utilityBills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utility Bills</Text>
          {data.utilityBills.map((bill) => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billInfo}>
                <Text style={styles.billTitle}>{bill.propertyTitle}</Text>
                <Text style={styles.billMeta}>
                  {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)} • Due{" "}
                  {formatDate(bill.dueDate)}
                </Text>
              </View>
              <Text style={styles.billAmount}>
                {formatCurrency(bill.amountDue, "TZS")}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    gap: spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  linkSubtitle: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 1,
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
  billCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  billMeta: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  billAmount: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.warning,
  },
});
