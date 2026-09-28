import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Mail, Phone, Chrome, Apple as AppleIcon } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

type AuthMode = "email" | "phone" | "oauth";

export default function AuthModal() {
  const router = useRouter();
  const { login, loginWithPhone, loginWithGoogle, loginWithApple, isLoading, setShowAuthModal, authTriggerAction } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("email");
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // How did we get here? The "/" gate pushes unauthenticated users onto
  // /auth during the startup ladder; features also open it via triggerAuth()
  // for browse-first actions. Gate arrivals re-run the ladder on success
  // instead of popping, so the KYC check can never be bypassed.
  const [arrivedViaGate] = useState<boolean>(() => !router.canDismiss());

  const handleClose = () => {
    setShowAuthModal(false);
    if (!arrivedViaGate && router.canDismiss()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore");
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    if (arrivedViaGate) {
      // Re-run the gate ladder; it routes to /kyc-details next for new users.
      router.replace("/");
    } else {
      handleClose();
    }
  };

  const handleEmailPhoneSubmit = async () => {
    setError("");

    if (!emailOrPhone.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    const isPhone = /^\+?[0-9]{10,15}$/.test(emailOrPhone);

    if (isPhone) {
      setMode("phone");
      setShowOtp(true);
    } else if (emailOrPhone.includes("@")) {
      try {
        await login(emailOrPhone);
        handleLoginSuccess();
        if (authTriggerAction) {
          console.log("Completed auth for action:", authTriggerAction);
        }
      } catch (err) {
        setError("Failed to sign in. Please try again.");
      }
    } else {
      setError("Please enter a valid email or phone number");
    }
  };

  const handleOtpSubmit = async () => {
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await loginWithPhone(emailOrPhone, otp);
      handleLoginSuccess();
      if (authTriggerAction) {
        console.log("Completed auth for action:", authTriggerAction);
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      handleLoginSuccess();
    } catch (err) {
      setError("Google sign-in failed");
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
      handleLoginSuccess();
    } catch (err) {
      setError("Apple sign-in failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {showOtp ? "Enter OTP" : "Welcome to MyTenant"}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {authTriggerAction && (
          <View style={styles.triggerBanner}>
            <Text style={styles.triggerText}>
              Sign in to {authTriggerAction === "wishlist" ? "save properties" : authTriggerAction === "message" ? "contact hosts" : authTriggerAction === "booking" ? "book this property" : "continue"}
            </Text>
          </View>
        )}

        {!showOtp ? (
          <>
            <View style={styles.content}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  {mode === "email" ? (
                    <Mail size={20} color={Colors.textSecondary} />
                  ) : (
                    <Phone size={20} color={Colors.textSecondary} />
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Email or phone number"
                    placeholderTextColor={Colors.textLight}
                    value={emailOrPhone}
                    onChangeText={setEmailOrPhone}
                    keyboardType={mode === "phone" ? "phone-pad" : "email-address"}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleEmailPhoneSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome size={20} color={Colors.text} />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleLogin}
                  disabled={isLoading}
                >
                  <AppleIcon size={20} color={Colors.text} />
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.content}>
              <Text style={styles.otpInstructions}>
                We&apos;ve sent a 6-digit code to {emailOrPhone}
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor={Colors.textLight}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOtpSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={() => setShowOtp(false)}
              >
                <Text style={styles.textButtonText}>Use a different method</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  modal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  triggerBanner: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  triggerText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: Colors.text,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  otpInput: {
    textAlign: "center",
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    letterSpacing: 8,
  },
  otpInstructions: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.small.fontSize,
    color: Colors.error,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  socialButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyMedium.fontWeight,
    color: Colors.text,
  },
  textButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  textButtonText: {
    fontSize: typography.body.fontSize,
    color: Colors.primary,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.caption.lineHeight * 1.5,
  },
});
