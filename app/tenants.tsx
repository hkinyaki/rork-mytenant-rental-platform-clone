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
import { Image } from "expo-image";
import { X, MessageCircle, Phone, BadgeCheck } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/components/dashboard/format";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

const RENT_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "rgba(0,166,153,0.1)", color: Colors.success },
  due: { bg: "rgba(255,180,0,0.12)", color: Colors.warning },
  overdue: { bg: "rgba(193,53,21,0.1)", color: Colors.error },
};

export default function TenantsScreen() {
  const router = useRouter();
  const tenantsQuery = trpc.landlord.tenants.useQuery({ hostId: "user-1" });

  const tenants = tenantsQuery.data?.tenants ?? [];
  const summary = tenantsQuery.data?.summary;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Tenant Directory",
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
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.totalTenants}</Text>
              <Text style={styles.summaryLabel}>Tenants</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                {summary.withBalance}
              </Text>
              <Text style={styles.summaryLabel}>With balance</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                {formatCurrency(summary.totalBalance, summary.currency)}
              </Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
          </View>
        )}

        {tenantsQuery.isLoading ? (
          <ActivityIndicator style={styles.loading} color={Colors.primary} />
        ) : (
          tenants.map((tenant) => {
            const statusStyle = RENT_STATUS_STYLES[tenant.rentStatus] ?? RENT_STATUS_STYLES.due;
            return (
              <View key={tenant.id} style={styles.tenantCard}>
                <View style={styles.tenantTop}>
                  <Image source={{ uri: tenant.photo }} style={styles.avatar} contentFit="cover" />
                  <View style={styles.tenantIdentity}>
                    <View style={styles.nameRow}>
                      <Text style={styles.tenantName}>{tenant.name}</Text>
                      {tenant.kycStatus === "verified" && (
                        <BadgeCheck size={16} color={Colors.success} />
                      )}
                    </View>
                    <Text style={styles.tenantUnit}>
                      {tenant.propertyTitle} · Unit {tenant.unit}
                    </Text>
                  </View>
                  <View style={[styles.rentBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.rentBadgeText, { color: statusStyle.color }]}>
                      {tenant.rentStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.tenantDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Monthly rent</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(tenant.monthlyRent, tenant.currency)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Balance</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        tenant.balance > 0 ? { color: Colors.error } : { color: Colors.success },
                      ]}
                    >
                      {formatCurrency(tenant.balance, tenant.currency)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Lease ends</Text>
                    <Text style={styles.detailValue}>{formatDate(tenant.leaseEnd)}</Text>
                  </View>
                </View>

                <View style={styles.tenantActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => router.push(`/conversation/conv-1` as any)}
                  >
                    <MessageCircle size={16} color={Colors.primary} />
                    <Text style={styles.contactButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactButton}>
                    <Phone size={16} color={Colors.textSecondary} />
                    <Text style={[styles.contactButtonText, { color: Colors.textSecondary }]}>
                      {tenant.phone}
                    </Text>
                  </TouchableOpacity>
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
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loading: {
    marginTop: spacing.xl,
  },
  tenantCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tenantTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: spacing.md,
  },
  tenantIdentity: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tenantName: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  tenantUnit: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rentBadgeText: {
    fontSize: 10,
    fontWeight: typography.captionBold.fontWeight,
    letterSpacing: 0.5,
  },
  tenantDetails: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
  },
  tenantActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
  },
  contactButtonText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.primary,
  },
});
