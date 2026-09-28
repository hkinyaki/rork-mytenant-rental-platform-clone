import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  TrendingUp,
  Home,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from "@/components/dashboard/format";
import type { inferRouterOutputs } from "@trpc/server/unstable-core-do-not-import";
import type { AppRouter } from "@/backend/trpc/app-router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type LandlordDashboardData = Extract<
  RouterOutputs["dashboard"]["get"],
  { role: "landlord" }
>;

interface LandlordDashboardProps {
  data: LandlordDashboardData;
}

/**
 * Landlord dashboard content: income summary, occupancy/revenue charts
 * (react-native-svg), property cards, pending applications with mock
 * approve/reject, financial overview link and an Add Property entry point.
 */
export default function LandlordDashboard({ data }: LandlordDashboardProps) {
  const router = useRouter();
  const [resolvedApps, setResolvedApps] = useState<Record<string, "approved" | "rejected">>({});

  const handleApplication = useCallback(
    (id: string, decision: "approved" | "rejected") => {
      // Mock affordance — real application handling lands with the backend work.
      setResolvedApps((prev) => ({ ...prev, [id]: decision }));
      Alert.alert(
        decision === "approved" ? "Application approved" : "Application rejected",
        "This is a demo action for now."
      );
    },
    []
  );

  const pendingApps = data.recentApplications.filter((app) => !resolvedApps[app.id]);
  const approvedCount = Object.values(resolvedApps).filter((d) => d === "approved").length;
  const rejectedCount = Object.values(resolvedApps).filter((d) => d === "rejected").length;

  const chartLabels = data.properties.map((property) => `P${data.properties.indexOf(property) + 1}`);

  return (
    <View style={styles.dashboardContent}>
      {/* Income summary */}
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
            Total {formatCurrency(data.stats.totalRevenue, data.stats.currency)} •{" "}
            {data.stats.activeProperties} properties • {data.stats.activeTenants} tenants
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

      {/* Add Property entry point */}
      <TouchableOpacity
        style={styles.addPropertyButton}
        onPress={() => router.push("/host-onboarding" as any)}
        activeOpacity={0.8}
      >
        <Plus size={20} color={Colors.background} />
        <Text style={styles.addPropertyButtonText}>Add Property</Text>
      </TouchableOpacity>

      {/* Occupancy chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Occupancy by property</Text>
        <SimpleBarChart
          values={data.properties.map((p) => p.occupancyRate)}
          labels={chartLabels}
          color={Colors.success}
          formatValue={(value) => `${Math.round(value)}%`}
        />
        <View style={styles.chartLegend}>
          {data.properties.map((property, index) => (
            <Text key={property.id} style={styles.chartLegendText} numberOfLines={1}>
              {`P${index + 1} · ${property.title}`}
            </Text>
          ))}
        </View>
      </View>

      {/* Revenue chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly revenue by property</Text>
        <SimpleBarChart
          values={data.properties.map((p) => p.monthlyRevenue)}
          labels={chartLabels}
          color={Colors.primary}
          formatValue={(value) => formatCurrencyCompact(value, "TZS")}
        />
        <View style={styles.chartLegend}>
          {data.properties.map((property, index) => (
            <Text key={property.id} style={styles.chartLegendText} numberOfLines={1}>
              {`P${index + 1} · ${formatCurrency(property.monthlyRevenue, "TZS")}/mo`}
            </Text>
          ))}
        </View>
      </View>

      {/* Financial overview entry */}
      <TouchableOpacity
        style={styles.financialsButton}
        onPress={() => router.push("/financials" as any)}
        activeOpacity={0.8}
      >
        <View style={styles.financialsInfo}>
          <Text style={styles.financialsTitle}>Financial Overview</Text>
          <Text style={styles.financialsSubtitle}>
            Revenue trend, occupancy history & collection rate
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.primary} />
      </TouchableOpacity>

      {/* Properties */}
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
              <Text style={styles.propertyDetail}>Occupancy: {property.occupancyRate}%</Text>
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

      {/* Pending applications (mock decisions) */}
      {(pendingApps.length > 0 || approvedCount + rejectedCount > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pending Applications</Text>
            {approvedCount + rejectedCount > 0 && (
              <Text style={styles.sectionMeta}>
                {approvedCount} approved · {rejectedCount} rejected
              </Text>
            )}
          </View>
          {pendingApps.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <Image
                source={{ uri: application.tenantPhoto }}
                style={styles.applicationPhoto}
                contentFit="cover"
              />
              <View style={styles.applicationInfo}>
                <Text style={styles.applicationName}>{application.tenantName}</Text>
                <Text style={styles.applicationProperty}>{application.propertyTitle}</Text>
                <Text style={styles.applicationDate}>
                  Applied {formatDate(application.submittedAt)}
                </Text>
              </View>
              <View style={styles.applicationActions}>
                <TouchableOpacity
                  style={[styles.applicationAction, styles.applicationReject]}
                  onPress={() => handleApplication(application.id, "rejected")}
                >
                  <XCircle size={20} color={Colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applicationAction, styles.applicationApprove]}
                  onPress={() => handleApplication(application.id, "approved")}
                >
                  <CheckCircle size={20} color={Colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {pendingApps.length === 0 && (
            <Text style={styles.allResolvedText}>
              All caught up — no pending applications.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  addPropertyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  addPropertyButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.background,
  },
  financialsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  financialsInfo: {
    flex: 1,
  },
  financialsTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  financialsSubtitle: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  chartLegend: {
    marginTop: spacing.xs,
    gap: 2,
  },
  chartLegendText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  sectionMeta: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  allResolvedText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    textAlign: "center",
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
  applicationAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  applicationReject: {
    backgroundColor: Colors.backgroundGray,
  },
  applicationApprove: {
    backgroundColor: Colors.success,
  },
});
