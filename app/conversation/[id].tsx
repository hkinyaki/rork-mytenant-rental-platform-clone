import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, SendHorizonal } from "lucide-react-native";
import { Image } from "expo-image";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const conversationQuery = trpc.messages.get.useQuery(
    { conversationId: id ?? "" },
    { enabled: Boolean(id) }
  );
  const sendMutation = trpc.messages.send.useMutation();

  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const conversation = conversationQuery.data?.conversation;
  const myId = user?.id || "user-1";

  // Keep the thread pinned to the newest message as data changes.
  const messageCount = conversation?.messages.length ?? 0;
  useEffect(() => {
    if (messageCount > 0) {
      const timeout = setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messageCount]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !conversation) return;

    setDraft("");
    try {
      await sendMutation.mutateAsync({
        conversationId: conversation.id,
        senderId: myId,
        senderName: user?.name || "You",
        text,
      });
      await conversationQuery.refetch();
    } catch (error) {
      console.error("Send message error:", error);
      setDraft(text); // restore draft so the user doesn't lose their message
    }
  };

  if (conversationQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: "Chat" }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: "Chat" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Conversation not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: conversation.participantName,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {conversation.propertyTitle && (
        <View style={styles.contextBar}>
          <Text style={styles.contextText} numberOfLines={1}>
            About: {conversation.propertyTitle}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMine = item.senderId === myId;
            return (
              <View
                style={[
                  styles.messageRow,
                  isMine ? styles.messageRowMine : styles.messageRowTheirs,
                ]}
              >
                {!isMine && (
                  <Image source={{ uri: conversation.participantPhoto }} style={styles.avatar} contentFit="cover" />
                )}
                <View
                  style={[
                    styles.bubble,
                    isMine ? styles.bubbleMine : styles.bubbleTheirs,
                  ]}
                >
                  {!isMine && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                  )}
                  <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.timestamp, isMine && styles.timestampMine]}>
                    {new Date(item.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Type a message…"
            placeholderTextColor={Colors.textLight}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <SendHorizonal size={18} color={Colors.background} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  contextBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.backgroundGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  contextText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    alignItems: "flex-end",
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowTheirs: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing.sm,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.backgroundGray,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: typography.body.fontSize,
    color: Colors.text,
    lineHeight: 21,
  },
  messageTextMine: {
    color: Colors.background,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  timestampMine: {
    color: "rgba(255,255,255,0.7)",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? spacing.sm + 2 : spacing.sm,
    paddingBottom: spacing.sm + 2,
    fontSize: typography.body.fontSize,
    color: Colors.text,
    maxHeight: 110,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
