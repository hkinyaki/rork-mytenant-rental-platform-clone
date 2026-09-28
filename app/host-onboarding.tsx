import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  FileText,
  Upload,
  Check,
  Camera,
  CreditCard,
  Home,
  MapPin,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

type Step = "kyc" | "tin" | "bank" | "property" | "complete";

export default function HostOnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("kyc");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    tinNumber: "",
    bankName: "",
    accountNumber: "",
    propertyTitle: "",
    propertyAddress: "",
    propertyType: "",
  });

  const steps: { id: Step; title: string; icon: any; completed: boolean }[] = [
    { id: "kyc", title: "KYC Verification", icon: User, completed: currentStep !== "kyc" },
    { id: "tin", title: "TIN Details", icon: FileText, completed: ["bank", "property", "complete"].includes(currentStep) },
    { id: "bank", title: "Bank Account", icon: CreditCard, completed: ["property", "complete"].includes(currentStep) },
    { id: "property", title: "Property Info", icon: Home, completed: currentStep === "complete" },
  ];

  const handleNext = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (currentStep === "kyc") {
      if (!formData.fullName || !formData.idNumber) {
        Alert.alert("Error", "Please fill in all KYC fields");
        setIsLoading(false);
        return;
      }
      setCurrentStep("tin");
    } else if (currentStep === "tin") {
      if (!formData.tinNumber) {
        Alert.alert("Error", "Please enter your TIN number");
        setIsLoading(false);
        return;
      }
      setCurrentStep("bank");
    } else if (currentStep === "bank") {
      if (!formData.bankName || !formData.accountNumber) {
        Alert.alert("Error", "Please fill in all bank details");
        setIsLoading(false);
        return;
      }
      setCurrentStep("property");
    } else if (currentStep === "property") {
      if (!formData.propertyTitle || !formData.propertyAddress) {
        Alert.alert("Error", "Please fill in property details");
        setIsLoading(false);
        return;
      }
      setCurrentStep("complete");
    }

    setIsLoading(false);
  };

  const handleComplete = () => {
    Alert.alert(
      "Application Submitted",
      "Your host application has been submitted successfully. We'll review it and get back to you within 2-3 business days.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "kyc":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <User size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>KYC Verification</Text>
            <Text style={styles.stepDescription}>
              We need to verify your identity to ensure platform security. This information is encrypted and stored securely.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Legal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name as per ID"
                placeholderTextColor={Colors.textLight}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your national ID number"
                placeholderTextColor={Colors.textLight}
                value={formData.idNumber}
                onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
              />
            </View>

            <TouchableOpacity style={styles.uploadButton}>
              <Camera size={20} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Upload ID & Selfie</Text>
            </TouchableOpacity>
          </View>
        );

      case "tin":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <FileText size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Tax Information</Text>
            <Text style={styles.stepDescription}>
              Your TIN (Tax Identification Number) is required for tax reporting and payouts.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TIN Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your TIN number"
                placeholderTextColor={Colors.textLight}
                value={formData.tinNumber}
                onChangeText={(text) => setFormData({ ...formData, tinNumber: text })}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Your TIN will be used for generating tax reports and ensuring compliance with local regulations.
              </Text>
            </View>
          </View>
        );

      case "bank":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <CreditCard size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Bank Account</Text>
            <Text style={styles.stepDescription}>
              Add your bank account to receive payouts from your bookings.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Select or enter bank name"
                placeholderTextColor={Colors.textLight}
                value={formData.bankName}
                onChangeText={(text) => setFormData({ ...formData, bankName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                placeholderTextColor={Colors.textLight}
                value={formData.accountNumber}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Account will be verified through micro-deposit or OTP before activation.
              </Text>
            </View>
          </View>
        );

      case "property":
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Home size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Property Information</Text>
            <Text style={styles.stepDescription}>
              Let&apos;s add your first property. You can add more properties later from your dashboard.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Modern 2BR in Westlands"
                placeholderTextColor={Colors.textLight}
                value={formData.propertyTitle}
                onChangeText={(text) => setFormData({ ...formData, propertyTitle: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter full address"
                placeholderTextColor={Colors.textLight}
                value={formData.propertyAddress}
                onChangeText={(text) => setFormData({ ...formData, propertyAddress: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={20} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Upload Property Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Upload Ownership Documents</Text>
            </TouchableOpacity>
          </View>
        );

      case "complete":
        return (
          <View style={styles.stepContent}>
            <View style={[styles.iconContainer, styles.successIconContainer]}>
              <Check size={64} color={Colors.background} />
            </View>
            <Text style={styles.stepTitle}>Almost There!</Text>
            <Text style={styles.stepDescription}>
              Your application is ready to submit. Our team will review your information and verify your documents within 2-3 business days.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Application Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{formData.fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TIN:</Text>
                <Text style={styles.summaryValue}>{formData.tinNumber}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bank:</Text>
                <Text style={styles.summaryValue}>{formData.bankName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Property:</Text>
                <Text style={styles.summaryValue}>{formData.propertyTitle}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.primaryButtonText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: "Become a Host",
          headerShown: true,
        }}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.progressStepContainer}>
              <View
                style={[
                  styles.progressDot,
                  step.completed && styles.progressDotCompleted,
                  currentStep === step.id && styles.progressDotActive,
                ]}
              >
                {step.completed ? (
                  <Check size={12} color={Colors.background} />
                ) : (
                  <step.icon
                    size={12}
                    color={
                      currentStep === step.id
                        ? Colors.background
                        : Colors.textLight
                    }
                  />
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    step.completed && styles.progressLineCompleted,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {currentStep !== "complete" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.backgroundGray,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStepContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: spacing.xs,
  },
  progressLineCompleted: {
    backgroundColor: Colors.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  stepContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successIconContainer: {
    backgroundColor: Colors.success,
  },
  stepTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: typography.body.lineHeight * 1.5,
  },
  inputGroup: {
    width: "100%",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
    width: "100%",
  },
  uploadButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.primary,
  },
  infoBox: {
    backgroundColor: Colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    width: "100%",
  },
  infoText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    lineHeight: typography.small.lineHeight * 1.5,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.lg,
    width: "100%",
  },
  summaryTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  completeButton: {
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
});
