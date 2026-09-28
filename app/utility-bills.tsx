import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Droplets, Zap, Wifi, Trash2, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/components/dashboard/format";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

const BILL_ICONS: Record<string, typeof Droplets> = {
  water: Droplets,
  electricity: Zap,
  internet: Wifi,
  garbage: Trash2,
};

export default function UtilityBillsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const listQuery = trpc.utilities.list.useQuery({
    userId: user?.id || "user-1",
  });
  const payMutation = trpc.utilities.pay.useMutation();

  const handlePay = async (billId: string) => {
    try {
      const result = await payMutation.mutateAsync({ billId });
      await listQuery.refetch();
      Alert.alert("Payment recorded", result.message || "The bill has been marked as paid.");
    } catch (error) {
      console.error("Pay bill error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    }
  };

  const bills = listQuery.data?.bills ?? [];
  const summary = listQuery.data?.summary;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Utility Bills",
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
        {summary && (
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Outstanding balance</Text>
            <Text style={styles.heroValue}>
              {formatCurrency(summary.outstanding, summary.currency)}
            </Text>
            <View style={styles.heroMetaRow}>
              <Text style={styles.heroMeta}>
                {summary.overdueCount} overdue
              </Text>
              <Text style={styles.heroMetaDot}>•</Text>
              <Text style={styles.heroMeta}>
                {formatCurrency(summary.paidThisMonth, summary.currency)} paid
              </Text>
            </View>
          </View>
        )}

        {listQuery.isLoading ? (
          <ActivityIndicator style={styles.loading} color={Colors.primary} />
        ) : bills.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={Colors.success} />
            <Text style={styles.emptyTitle}>All bills settled</Text>
            <Text style={styles.emptyText}>Nothing to pay right now.</Text>
          </View>
        ) : (
          bills.map((bill) => {
            const Icon = BILL_ICONS[bill.type] ?? Droplets;
            const isPaid = bill.status === "paid";
            const isOverdue = bill.status === "overdue";
            return (
              <View key={bill.id} style={styles.billCard}>
                <View style={[styles.billIconWrap, isOverdue && styles.billIconOverdue]}>
                  <Icon size={22} color={isOverdue ? Colors.error : Colors.primary} />
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billTitle}>
                    {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                  </Text>
                  <Text style={styles.billProperty}>{bill.propertyTitle}</Text>
                  <Text
                    style={[
                      styles.billMeta,
                      isOverdue && styles.billMetaOverdue,
                    ]}
                  >
                    {isPaid
                      ? `Paid ${bill.paidAt ? formatDate(bill.paidAt) : ""}`
                      : isOverdue
                        ? `Overdue — was due ${formatDate(bill.dueDate)}`
                        : `Due ${formatDate(bill.dueDate)}`}
                  </Text>
                </View>
                <View style={styles.billRight}>
                  <Text style={[styles.billAmount, isOverdue && styles.billAmountOverdue]}>
                    {formatCurrency(bill.amountDue, bill.currency)}
                  </Text>
                  {!isPaid && (
                    <TouchableOpacity
                      style={[styles.payButton, payMutation.isPending && styles.buttonDisabled]}
                      onPress={() => handlePay(bill.id)}
                      disabled={payMutation.isPending}
                    >
                      <Text style={styles.payButtonText}>Pay</Text>
                    </TouchableOpacity>
                  )}
                  {isPaid && <CheckCircle size={20} color={Colors.success} />}
                </View>
              </View>
            );
          })
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
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroLabel: {
    fontSize: typography.small.fontSize,
    color: "rgba(255,255,255,0.85)",
  },
  heroValue: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: Colors.background,
    marginVertical: 4,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroMeta: {
    fontSize: typography.small.fontSize,
    color: "rgba(255,255,255,0.85)",
  },
  heroMetaDot: {
    color: "rgba(255,255,255,0.85)",
  },
  loading: {
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  emptyText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  billIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  billIconOverdue: {
    backgroundColor: "rgba(193,53,21,0.08)",
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  billProperty: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginVertical: 1,
  },
  billMeta: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  billMetaOverdue: {
    color: Colors.error,
    fontWeight: typography.captionBold.fontWeight,
  },
  billRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  billAmount: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  billAmountOverdue: {
    color: Colors.error,
  },
  payButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: Colors.background,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
  },
});
