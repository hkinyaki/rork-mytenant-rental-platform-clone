import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { MessageCircle, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, triggerAuth, activeMode, user } = useAuth();
  const conversationsQuery = trpc.messages.conversations.useQuery(
    { userId: user?.id || "user-1" },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.authPrompt}>
          <MessageCircle size={64} color={Colors.primary} />
          <Text style={styles.authTitle}>Sign in to view your messages</Text>
          <Text style={styles.authSubtitle}>
            Connect with landlords and tenants and manage your conversations
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => triggerAuth("messages")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  type ConversationItem = NonNullable<
    typeof conversationsQuery extends { data: infer D | undefined } ? D : never
  >["conversations"][number];

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/conversation/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.participantPhoto }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.timestamp}>
              {item.lastMessage
                ? new Date(item.lastMessage.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </Text>
          </View>
        </View>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.propertyTitle ?? ""}
        </Text>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage?.text ?? ""}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {conversationsQuery.isLoading ? (
        <ActivityIndicator style={styles.loading} color={Colors.primary} />
      ) : (
        <FlatList
          data={conversationsQuery.data?.conversations ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                {activeMode === "landlord"
                  ? "Message your tenants from a property to get started"
                  : "Browse properties and message a landlord to get started"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 60,
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
  list: {
    flexGrow: 1,
  },
  loading: {
    marginTop: spacing.xl,
  },
  conversationCard: {
    flexDirection: "row",
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  userName: {
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginRight: spacing.sm,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  propertyTitle: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  lastMessage: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  unreadMessage: {
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: Colors.background,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: spacing.md + 56 + spacing.md,
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
  },
  authButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
