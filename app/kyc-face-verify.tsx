import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { CameraOff, RefreshCcw, ShieldCheck } from "lucide-react-native";
import KycStepHeader from "@/components/KycStepHeader";
import { useAuth } from "@/contexts/AuthContext";
import { loadKycDraft, saveKycDraft, finalizeKycSubmission } from "@/lib/kyc-draft";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

/**
 * KYC step 3 of 3 — Live face selfie.
 * Live front-camera preview with a face guide; capture, review, retake,
 * then finalize the KYC submission and return to the "/" gate, which now
 * routes into the main app because KYC is verified.
 */
export default function KycFaceVerifyScreen() {
  const router = useRouter();
  const { completeKyc } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Guard: steps 1-2 must be complete before a selfie makes sense.
  useEffect(() => {
    let cancelled = false;
    loadKycDraft().then((draft) => {
      if (cancelled) return;
      if (!draft.personalDetails || !draft.idDocument) {
        Alert.alert(
          "Missing information",
          "Please complete the previous verification steps first.",
          [{ text: "OK", onPress: () => router.replace("/kyc-details") }]
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
      }
    } catch (error) {
      console.error("Selfie capture error:", error);
      Alert.alert(
        "Capture failed",
        "We couldn't take the photo. Please try again — or continue in the mobile app where the camera is available."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const handleConfirm = async () => {
    if (!capturedUri) return;
    setIsSubmitting(true);
    try {
      const draft = await loadKycDraft();
      if (!draft.personalDetails || !draft.idDocument) {
        Alert.alert("Missing information", "Please complete the previous steps first.", [
          { text: "OK", onPress: () => router.replace("/kyc-details") },
        ]);
        return;
      }

      await saveKycDraft({
        ...draft,
        selfie: {
          imageUri: capturedUri,
          capturedAt: new Date().toISOString(),
          livenessMethod: "live_camera",
        },
      });

      const finalDraft = await loadKycDraft();
      await finalizeKycSubmission(finalDraft, completeKyc);

      // Re-run the gate ladder: KYC is verified now, so it routes to (tabs).
      router.replace("/");
    } catch (error) {
      console.error("KYC finalize error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Permission states -------------------------------------------------
  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <View style={styles.permissionIconWrap}>
            <CameraOff size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            We use your camera for a quick live selfie to verify your identity.
            Your photo is used only for verification.
          </Text>
          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => requestPermission()}>
              <Text style={styles.primaryButtonText}>Grant camera access</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.primaryButtonText}>Open settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Camera / captured phases ------------------------------------------
  return (
    <View style={styles.full}>
      <Stack.Screen options={{ headerShown: false }} />

      {capturedUri ? (
        <>
          <Image source={{ uri: capturedUri }} style={styles.capturedImage} contentFit="cover" />
          <SafeAreaView style={styles.capturedOverlay} edges={["top", "bottom"]}>
            <View style={styles.capturedHeader}>
              <ShieldCheck size={20} color={Colors.success} />
              <Text style={styles.capturedTitle}>Looks good?</Text>
            </View>
            <View style={styles.capturedActions}>
              <TouchableOpacity style={styles.outlineButton} onPress={handleRetake} disabled={isSubmitting}>
                <RefreshCcw size={18} color={Colors.text} />
                <Text style={styles.outlineButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flexButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify &amp; finish</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="picture" />
          <SafeAreaView style={styles.cameraOverlay} edges={["top", "bottom"]}>
            <KycStepHeader
              step={3}
              title="Verify your face"
              subtitle="Center your face in the circle in good light, then take the selfie."
            />
            <View style={styles.guideWrap} pointerEvents="none">
              <View style={styles.faceGuide} />
            </View>
            <View style={styles.captureRow}>
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  full: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  guideWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  faceGuide: {
    width: 260,
    height: 340,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  captureRow: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
  },
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
  },
  capturedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  capturedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  capturedTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.background,
  },
  capturedActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  outlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: Colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  outlineButtonText: {
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.background,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.lg,
    minWidth: 240,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: typography.bodySemibold.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  permissionIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.backgroundGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.lineHeight,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});
