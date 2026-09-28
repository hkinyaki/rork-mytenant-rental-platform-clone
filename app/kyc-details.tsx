import React, { useState, useEffect } from "react";
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
import { BadgeCheck } from "lucide-react-native";
import KycStepHeader from "@/components/KycStepHeader";
import { useAuth } from "@/contexts/AuthContext";
import { loadKycDraft, saveKycDraft } from "@/lib/kyc-draft";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { KycPersonalDetails } from "@/types";

/**
 * KYC step 1 of 3 — Personal details.
 * Saves a draft and forwards to /kyc-id-upload (step 2).
 */
export default function KycDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.name ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>(user?.phone ?? "");
  const [idNumber, setIdNumber] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill from any previously saved draft (user may have come back).
  useEffect(() => {
    let cancelled = false;
    loadKycDraft().then((draft) => {
      if (cancelled || !draft.personalDetails) return;
      const d = draft.personalDetails;
      setFullName(d.fullName || user?.name || "");
      setEmail(d.email || user?.email || "");
      setPhone(d.phone || user?.phone || "");
      setIdNumber(d.idNumber);
      setCity(d.city);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!email.includes("@")) next.email = "Enter a valid email address";
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim()))
      next.phone = "Enter a valid phone number";
    if (!idNumber.trim()) next.idNumber = "National ID / passport number is required";
    if (!city.trim()) next.city = "City is required";
    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const details: KycPersonalDetails = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        idNumber: idNumber.trim(),
        city: city.trim(),
      };
      const draft = await loadKycDraft();
      await saveKycDraft({ ...draft, personalDetails: details });
      // Replace (not push) so the KYC chain never builds history below the
      // final destination; the gate re-run handles "back" navigation.
      router.replace("/kyc-id-upload");
    } catch (error) {
      console.error("KYC details save error:", error);
      Alert.alert("Something went wrong", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
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
          <KycStepHeader
            step={1}
            title="Tell us about yourself"
            subtitle="We verify every MyTenant member to keep rentals safe for hosts and tenants alike. This takes about a minute."
            hideBack={!router.canDismiss()}
          />

          <View style={styles.badgeRow}>
            <BadgeCheck size={18} color={Colors.success} />
            <Text style={styles.badgeText}>Identity verification</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="e.g. Alex Maina"
                placeholderTextColor={Colors.textLight}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+254 7XX XXX XXX"
                placeholderTextColor={Colors.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>National ID / passport number</Text>
              <TextInput
                style={[styles.input, errors.idNumber && styles.inputError]}
                placeholder="Enter your ID or passport number"
                placeholderTextColor={Colors.textLight}
                value={idNumber}
                onChangeText={setIdNumber}
                autoCapitalize="characters"
              />
              {errors.idNumber ? <Text style={styles.errorText}>{errors.idNumber}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="e.g. Nairobi"
                placeholderTextColor={Colors.textLight}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.submitButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Your details are encrypted and only used for identity verification.
          </Text>
        </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  badgeText: {
    marginLeft: spacing.xs,
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.success,
  },
  form: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.sm + 2 : spacing.sm,
    fontSize: typography.body.fontSize,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: Colors.error,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: typography.bodySemibold.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  disclaimer: {
    marginTop: spacing.md,
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
    textAlign: "center",
  },
});
