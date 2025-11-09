import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MessageCircle, Clock } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

interface MockConversation {
  id: string;
  propertyTitle: string;
  propertyPhoto: string;
  otherUserName: string;
  otherUserPhoto: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: "1",
    propertyTitle: "Modern 2BR Apartment in Westlands",
    propertyPhoto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
    otherUserName: "Sarah Johnson",
    otherUserPhoto: "https://i.pravatar.cc/150?img=1",
    lastMessage: "The property is available for viewing tomorrow",
    timestamp: "2h ago",
    unreadCount: 2,
  },
  {
    id: "2",
    propertyTitle: "Cozy Studio in Kilimani",
    propertyPhoto: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=200",
    otherUserName: "David Kamau",
    otherUserPhoto: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Thank you for your interest!",
    timestamp: "1d ago",
    unreadCount: 0,
  },
];

export default function MessagesScreen() {
  const { isAuthenticated, triggerAuth } = useAuth();

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
            Connect with hosts and manage your conversations
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

  const renderItem = ({ item }: { item: MockConversation }) => (
    <TouchableOpacity style={styles.conversationCard}>
      <Image
        source={{ uri: item.otherUserPhoto }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUserName}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.propertyTitle}
        </Text>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
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

      <FlatList
        data={MOCK_CONVERSATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with a host
            </Text>
          </View>
        }
      />
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
