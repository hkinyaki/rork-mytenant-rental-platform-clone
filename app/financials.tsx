import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, TrendingUp, Percent, Wallet } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/components/dashboard/format";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

export default function FinancialsScreen() {
  const router = useRouter();
  const financialsQuery = trpc.landlord.financials.useQuery({ hostId: "user-1" });

  const data = financialsQuery.data;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Financial Overview",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {financialsQuery.isLoading || !data ? (
          <ActivityIndicator style={styles.loading} color={Colors.primary} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={Colors.success} />
                <Text style={styles.statValue}>
                  {formatCurrencyCompact(data.monthlyRevenue, data.currency)}
                </Text>
                <Text style={styles.statLabel}>Monthly</Text>
              </View>
              <View style={styles.statCard}>
                <Percent size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{data.collectionRate}%</Text>
                <Text style={styles.statLabel}>Collected</Text>
              </View>
              <View style={styles.statCard}>
                <Wallet size={20} color={Colors.error} />
                <Text style={styles.statValue}>
                  {formatCurrencyCompact(data.outstandingBalance, data.currency)}
                </Text>
                <Text style={styles.statLabel}>Outstanding</Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Revenue trend (6 months)</Text>
              <SimpleBarChart
                values={data.revenueByMonth.map((m) => m.revenue)}
                labels={data.revenueByMonth.map((m) => m.label)}
                color={Colors.success}
                formatValue={(value) => formatCurrencyCompact(value, data.currency)}
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Occupancy history</Text>
              <SimpleBarChart
                values={data.occupancyByMonth.map((m) => m.occupancy)}
                labels={data.occupancyByMonth.map((m) => m.label)}
                color={Colors.primary}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Payments</Text>
              {data.recentPayments.length === 0 ? (
                <Text style={styles.emptyText}>No payments recorded yet.</Text>
              ) : (
                data.recentPayments.map((payment) => (
                  <View key={payment.id} style={styles.paymentRow}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTenant}>{payment.tenantName}</Text>
                      <Text style={styles.paymentProperty} numberOfLines={1}>
                        {payment.propertyTitle}
                      </Text>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.paymentAmount}>
                        +{formatCurrency(payment.amount, payment.currency)}
                      </Text>
                      <Text style={styles.paymentDate}>{formatDate(payment.paidAt)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loading: {
    marginTop: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  chartCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
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
  emptyText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    textAlign: "center",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTenant: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  paymentProperty: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 1,
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.success,
  },
  paymentDate: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
});
