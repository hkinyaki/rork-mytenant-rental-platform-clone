import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus, X, Wrench, Plus } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

const PRIORITIES = ["low", "medium", "high"] as const;
type Priority = (typeof PRIORITIES)[number];

const STATUS_COLORS: Record<string, string> = {
  open: Colors.warning,
  in_progress: Colors.primary,
  resolved: Colors.success,
  closed: Colors.textLight,
};

export default function MaintenanceScreen() {
  const router = useRouter();
  const { user, activeMode } = useAuth();
  const view = activeMode === "landlord" ? "landlord" : "tenant";

  const listQuery = trpc.maintenance.list.useQuery({
    userId: user?.id || "user-1",
    view,
  });
  const createMutation = trpc.maintenance.create.useMutation();
  const updateStatusMutation = trpc.maintenance.updateStatus.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickPhotos = async (source: "camera" | "library") => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        quality: 0.7,
        selectionLimit: 3 - photos.length,
        exif: false,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync({
              ...options,
              mediaTypes: ["images"],
            });
      if (result.canceled) return;
      const uris = result.assets.map((a) => a.uri).filter(Boolean);
      setPhotos((prev) => [...prev, ...uris].slice(0, 3));
    } catch (error) {
      console.error("Photo pick error:", error);
      Alert.alert("Unavailable", "Photo attachments aren't available in this preview. Continue in the mobile app.");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing details", "Please add a title and description.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        userId: user?.id || "user-1",
        propertyId: "prop-1",
        propertyTitle: "Modern 2BR Apartment in Masaki",
        title: title.trim(),
        description: description.trim(),
        priority,
        photos,
      });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setPhotos([]);
      setPriority("medium");
      await listQuery.refetch();
    } catch (error) {
      console.error("Create ticket error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: "in_progress" | "resolved") => {
    try {
      await updateStatusMutation.mutateAsync({ ticketId, status });
      await listQuery.refetch();
    } catch (error) {
      console.error("Status update error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    }
  };

  const tickets = listQuery.data?.tickets ?? [];
  const summary = listQuery.data?.summary;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen
        options={{
          title: activeMode === "landlord" ? "Maintenance Requests" : "My Maintenance",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {summary && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: STATUS_COLORS.open }]}>
                  {summary.open}
                </Text>
                <Text style={styles.summaryLabel}>Open</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: STATUS_COLORS.in_progress }]}>
                  {summary.inProgress}
                </Text>
                <Text style={styles.summaryLabel}>In progress</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: STATUS_COLORS.resolved }]}>
                  {summary.resolved}
                </Text>
                <Text style={styles.summaryLabel}>Resolved</Text>
              </View>
            </View>
          )}

          {view === "tenant" && !showForm && (
            <TouchableOpacity style={styles.newButton} onPress={() => setShowForm(true)}>
              <Plus size={20} color={Colors.background} />
              <Text style={styles.newButtonText}>New Request</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Describe the issue</Text>

              <TextInput
                style={styles.input}
                placeholder="Short title (e.g. Leaking faucet)"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's happening? Where is it? Since when?"
                placeholderTextColor={Colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityChip, priority === p && styles.priorityChipActive]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === p && styles.priorityTextActive,
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Photos ({photos.length}/3)</Text>
              <View style={styles.photoRow}>
                {photos.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X size={12} color={Colors.background} />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 3 && (
                  <>
                    <TouchableOpacity
                      style={styles.photoAdd}
                      onPress={() => pickPhotos("camera")}
                    >
                      <Camera size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.photoAdd}
                      onPress={() => pickPhotos("library")}
                    >
                      <ImagePlus size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.background} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {listQuery.isLoading ? (
            <ActivityIndicator style={styles.loading} color={Colors.primary} />
          ) : tickets.length === 0 ? (
            <View style={styles.emptyState}>
              <Wrench size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No maintenance requests</Text>
              <Text style={styles.emptyText}>
                {view === "tenant"
                  ? "Raise a request when something needs fixing — attach photos to speed things up."
                  : "Requests from your tenants will appear here."}
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>{ticket.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[ticket.status] }]}>
                    <Text style={styles.statusText}>
                      {ticket.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketProperty}>{ticket.propertyTitle}</Text>
                <Text style={styles.ticketDescription}>{ticket.description}</Text>

                {ticket.photos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
                    {ticket.photos.map((uri, index) => (
                      <Image
                        key={`${uri}-${index}`}
                        source={{ uri }}
                        style={styles.ticketPhoto}
                        contentFit="cover"
                      />
                    ))}
                  </ScrollView>
                )}

                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketMeta}>
                    {ticket.priority.toUpperCase()} priority · {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                  <View style={styles.ticketActions}>
                    {view === "landlord" && ticket.status === "open" && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleStatusChange(ticket.id, "in_progress")}
                      >
                        <Text style={styles.actionButtonText}>Start</Text>
                      </TouchableOpacity>
                    )}
                    {(view === "landlord" ? ticket.status === "in_progress" : ticket.status === "open" || ticket.status === "in_progress") && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => handleStatusChange(ticket.id, "resolved")}
                      >
                        <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                          Mark Resolved
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  newButtonText: {
    color: Colors.background,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  formCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body.fontSize,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  fieldLabel: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  priorityRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priorityText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: Colors.background,
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: "wrap",
  },
  photoThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
  },
  photoThumb: {
    width: "100%",
    height: "100%",
  },
  photoRemove: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundGray,
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
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
    textAlign: "center",
    lineHeight: 20,
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
    marginBottom: 4,
    gap: spacing.sm,
  },
  ticketTitle: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    color: Colors.background,
    textTransform: "capitalize",
    fontWeight: typography.captionBold.fontWeight,
  },
  ticketProperty: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    marginBottom: spacing.sm,
  },
  ticketDescription: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  photoStrip: {
    marginBottom: spacing.sm,
  },
  ticketPhoto: {
    width: 96,
    height: 72,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  ticketMeta: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    flex: 1,
  },
  ticketActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  actionButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
    color: Colors.textSecondary,
  },
  actionButtonTextPrimary: {
    color: Colors.background,
  },
});
