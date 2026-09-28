import React, { useState, useEffect, useCallback } from "react";
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
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CreditCard, Globe, Camera, ImagePlus, RefreshCcw, IdCard } from "lucide-react-native";
import KycStepHeader from "@/components/KycStepHeader";
import { loadKycDraft, saveKycDraft } from "@/lib/kyc-draft";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { IdDocumentType, KycIdDocument } from "@/types";

const DOC_TYPES: { value: IdDocumentType; label: string; description: string; icon: typeof CreditCard }[] = [
  {
    value: "national_id",
    label: "National ID",
    description: "Both front sides visible, details legible",
    icon: CreditCard,
  },
  {
    value: "passport",
    label: "Passport",
    description: "Photo page, machine-readable zone visible",
    icon: Globe,
  },
];

/**
 * KYC step 2 of 3 — ID document photo.
 * Captures via camera (native crop UI) or library, allows retake, then
 * forwards to /kyc-face-verify (step 3).
 */
export default function KycIdUploadScreen() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<IdDocumentType>("national_id");
  const [imageUri, setImageUri] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    loadKycDraft().then((draft) => {
      if (cancelled) return;
      if (draft.idDocument) {
        setDocumentType(draft.idDocument.documentType);
        setImageUri(draft.idDocument.imageUri);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const pickImage = useCallback(
    async (source: "camera" | "library") => {
      setIsProcessing(true);
      try {
        const options: ImagePicker.ImagePickerOptions = {
          allowsEditing: true, // native crop-adjust UI before confirm
          aspect: [16, 10],
          quality: 0.8,
          exif: false,
        };
        const result =
          source === "camera"
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync({
                ...options,
                mediaTypes: ["images"],
              });

        if (result.canceled || !result.assets?.[0]?.uri) {
          return; // user backed out of the picker/camera — keep current state
        }
        setImageUri(result.assets[0].uri);
      } catch (error) {
        console.error("ID capture error:", error);
        Alert.alert(
          "Camera unavailable",
          source === "camera"
            ? "We couldn't open the camera. You can pick a photo from your library instead, or continue in the web preview."
            : "We couldn't open your photo library. Please try again."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleContinue = async () => {
    if (!imageUri) return;
    try {
      const doc: KycIdDocument = {
        documentType,
        imageUri,
        capturedAt: new Date().toISOString(),
      };
      const draft = await loadKycDraft();
      await saveKycDraft({ ...draft, idDocument: doc });
      // Replace (not push) — keeps the stack shallow; gate handles back nav.
      router.replace("/kyc-face-verify");
    } catch (error) {
      console.error("ID draft save error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KycStepHeader
          step={2}
          title="Upload your ID document"
          subtitle="Take a photo of your document. You can adjust the crop before confirming."
        />

        <View style={styles.docTypeRow}>
          {DOC_TYPES.map(({ value, label, description, icon: Icon }) => {
            const selected = documentType === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.docTypeCard, selected && styles.docTypeCardSelected]}
                onPress={() => setDocumentType(value)}
                activeOpacity={0.8}
              >
                <Icon size={22} color={selected ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.docTypeLabel, selected && styles.docTypeLabelSelected]}>
                  {label}
                </Text>
                <Text style={styles.docTypeDescription}>{description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.previewWrapper}>
          <View style={styles.previewBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <IdCard size={40} color={Colors.textLight} />
                <Text style={styles.previewPlaceholderText}>
                  No document photo yet
                </Text>
              </View>
            )}

            {isProcessing ? (
              <View style={styles.previewBusy}>
                <ActivityIndicator color={Colors.background} />
              </View>
            ) : null}
          </View>

          {imageUri ? (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => pickImage("camera")}
              disabled={isProcessing}
            >
              <RefreshCcw size={16} color={Colors.primary} />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => pickImage("camera")}
            disabled={isProcessing}
          >
            <Camera size={20} color={Colors.text} />
            <Text style={styles.captureButtonText}>Take photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => pickImage("library")}
            disabled={isProcessing}
          >
            <ImagePlus size={20} color={Colors.text} />
            <Text style={styles.captureButtonText}>Library</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Photo tips</Text>
          <Text style={styles.tipsText}>
            {"\u2022"} Place the document on a flat surface in good light{"\n"}
            {"\u2022"} Avoid glare and shadows over the text{"\n"}
            {"\u2022"} Fill the frame — no fingers or edges cut off
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !imageUri && styles.submitButtonDisabled]}
          onPress={handleContinue}
          disabled={!imageUri || isProcessing}
        >
          <Text style={styles.submitButtonText}>Continue to selfie</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  docTypeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  docTypeCard: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  docTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  docTypeLabel: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.textSecondary,
  },
  docTypeLabelSelected: {
    color: Colors.primary,
  },
  docTypeDescription: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  previewWrapper: {
    marginBottom: spacing.md,
  },
  previewBox: {
    aspectRatio: 16 / 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundGray,
    overflow: "hidden",
  },
  previewImage: {
    flex: 1,
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  previewPlaceholderText: {
    fontSize: typography.small.fontSize,
    color: Colors.textLight,
  },
  previewBusy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-end",
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  retakeButtonText: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.primary,
  },
  captureRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  captureButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background,
  },
  captureButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.text,
  },
  tipsBox: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.lineHeight + 2,
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: typography.bodySemibold.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
});
