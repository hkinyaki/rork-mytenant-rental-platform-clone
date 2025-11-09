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
import { ArrowLeft, CreditCard, Download, CheckCircle, Clock, XCircle, Smartphone } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const paymentsQuery = trpc.payments.list.useQuery({
    userId: user?.id || "user-1",
  });

  const formatCurrency = (amount: number, currency: string = "TZS") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} color={Colors.success} />;
      case "pending":
        return <Clock size={20} color={Colors.warning} />;
      case "failed":
        return <XCircle size={20} color={Colors.error} />;
      case "held":
        return <Clock size={20} color={Colors.primary} />;
      default:
        return <Clock size={20} color={Colors.textLight} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  if (paymentsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Payments",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </View>
    );
  }

  if (!paymentsQuery.data) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Payments",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load payments</Text>
        </View>
      </View>
    );
  }

  const data = paymentsQuery.data;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Payments",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(data.summary.totalSpent, data.summary.currency)}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>This Month</Text>
              <Text style={styles.summaryItemValue}>
                {formatCurrency(data.summary.thisMonth, data.summary.currency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Deposits Held</Text>
              <Text style={styles.summaryItemValue}>
                {formatCurrency(data.summary.depositsHeld, data.summary.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {data.paymentMethods.map((method) => {
            const isMobile = method.type === "mpesa" || method.type === "airtel_money";
            const isCard = method.type === "card";
            return (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodIcon}>
                  {isMobile ? (
                    <Smartphone size={20} color={Colors.primary} />
                  ) : (
                    <CreditCard size={20} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>
                    {method.type === "mpesa" ? "M-Pesa" : 
                     method.type === "airtel_money" ? "Airtel Money" :
                     isCard ? `${method.brand || "Card"} •••• ${method.last4 || "****"}` : 
                     "Bank Account"}
                  </Text>
                  {method.phoneNumber && isMobile && (
                    <Text style={styles.methodDetail}>{method.phoneNumber}</Text>
                  )}
                  {isCard && method.expiryMonth && method.expiryYear && (
                    <Text style={styles.methodDetail}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  )}
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {data.transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>{getStatusIcon(tx.status)}</View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{getTypeLabel(tx.type)}</Text>
                  <Text style={styles.transactionProperty}>{tx.propertyTitle}</Text>
                  {tx.description && (
                    <Text style={styles.transactionDescription}>{tx.description}</Text>
                  )}
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionDate}>{formatDate(tx.date)}</Text>
                    <Text style={styles.transactionDot}>•</Text>
                    <Text style={styles.transactionMethod}>{tx.method}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, tx.status === "completed" && styles.transactionAmountCompleted]}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </Text>
                  {tx.receiptUrl && tx.status === "completed" && (
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
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
  scrollView: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: Colors.error,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: typography.small.fontSize,
    color: Colors.background,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.background,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.background,
    opacity: 0.8,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.background,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  methodCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  methodDetail: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: typography.caption.fontSize,
    color: Colors.background,
    fontWeight: typography.smallMedium.fontWeight,
  },
  transactionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  transactionIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  transactionProperty: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
  transactionDot: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginHorizontal: 4,
  },
  transactionMethod: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
  transactionRight: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },
  transactionAmount: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  transactionAmountCompleted: {
    color: Colors.success,
  },
  downloadButton: {
    padding: 4,
  },
});
