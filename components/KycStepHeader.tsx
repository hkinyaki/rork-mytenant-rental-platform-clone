import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

interface KycStepHeaderProps {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  /** Hides the back button when there is no meaningful previous screen. */
  hideBack?: boolean;
}

const TOTAL_STEPS = 3;

export default function KycStepHeader({ step, title, subtitle, hideBack = false }: KycStepHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canDismiss()) {
      router.back();
    } else {
      // e.g. user re-opened the flow on the last step via a deep link.
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {!hideBack ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.stepLabel}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backPlaceholder: {
    width: 40,
  },
  stepLabel: {
    fontSize: typography.captionBold.fontSize,
    fontWeight: typography.captionBold.fontWeight,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.lineHeight,
    color: Colors.textSecondary,
  },
});
