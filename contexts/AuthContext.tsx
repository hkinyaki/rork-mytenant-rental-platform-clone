import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, KYCStatus } from "@/types";
import { MOCK_CURRENT_USER } from "@/mocks/users";

/**
 * Which dashboard view the user is looking at. Capability to act in a mode
 * comes from user.role; activeMode is just the current lens. Only users with
 * landlord capability (role "host" or "both") can hold "landlord".
 */
export type ActiveMode = "tenant" | "landlord";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  hasCompletedOnboarding: boolean;
  kycStatus: KYCStatus | null;
  isKycVerified: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithPhone: (phone: string, otp?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authTriggerAction: string | null;
  triggerAuth: (action: string) => void;
  switchRole: (newRole: ActiveMode) => Promise<void>;
  isSwitchingRole: boolean;
  activeMode: ActiveMode;
  isDualRole: boolean;
  canListProperties: boolean;
  completeOnboarding: () => Promise<void>;
  completeKyc: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextValue>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>("tenant");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTriggerAction, setAuthTriggerAction] = useState<string | null>(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);

  // Hydrate persisted session/flags once on mount so the "/" gate sees real state.
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const [storedUser, onboardingFlag, storedKycStatus, storedActiveMode] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("hasCompletedOnboarding"),
          AsyncStorage.getItem("kycStatus"),
          AsyncStorage.getItem("activeMode"),
        ]);
        if (cancelled) return;

        let hydratedMode: ActiveMode = "tenant";
        if (storedActiveMode === "landlord" || storedActiveMode === "tenant") {
          hydratedMode = storedActiveMode;
        }

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setUser(parsedUser);
            // Clamp mode to capabilities: a pure tenant can't be in landlord view.
            if (parsedUser.role === "tenant") {
              hydratedMode = "tenant";
            }
          } catch {
            await AsyncStorage.removeItem("user");
          }
        }

        setActiveMode(hydratedMode);
        setHasCompletedOnboarding(onboardingFlag === "true");
        if (storedKycStatus === "pending" || storedKycStatus === "verified" || storedKycStatus === "rejected") {
          setKycStatus(storedKycStatus);
        }
      } catch (error) {
        console.error("Auth hydration error:", error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistUser = useCallback(async (next: User) => {
    setUser(next);
    await AsyncStorage.setItem("user", JSON.stringify(next));
  }, []);

  const login = useCallback(
    async (email: string, password?: string) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const authenticatedUser = { ...MOCK_CURRENT_USER, email };
        await persistUser(authenticatedUser);
        setShowAuthModal(false);
        console.log("User logged in:", email);
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser]
  );

  const loginWithPhone = useCallback(
    async (phone: string, otp?: string) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const authenticatedUser = { ...MOCK_CURRENT_USER, phone };
        await persistUser(authenticatedUser);
        setShowAuthModal(false);
        console.log("User logged in with phone:", phone);
      } catch (error) {
        console.error("Phone login error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser]
  );

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await persistUser(MOCK_CURRENT_USER);
      setShowAuthModal(false);
      console.log("User logged in with Google");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await persistUser(MOCK_CURRENT_USER);
      setShowAuthModal(false);
      console.log("User logged in with Apple");
    } catch (error) {
      console.error("Apple login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
    // Reset the active role view so the next session starts as tenant.
    setActiveMode("tenant");
    await AsyncStorage.removeItem("activeMode");
    console.log("User logged out");
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const triggerAuth = useCallback((action: string) => {
    setAuthTriggerAction(action);
    setShowAuthModal(true);
    console.log("Auth triggered for action:", action);
  }, []);

  // Flips the active *view* only — user.role (capability) is untouched.
  // Becoming a landlord for real goes through the host-onboarding flow.
  const switchRole = useCallback(
    async (newRole: ActiveMode) => {
      if (!user) return;

      setIsSwitchingRole(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setActiveMode(newRole);
        await AsyncStorage.setItem("activeMode", newRole);

        console.log("Active role view switched to:", newRole);
      } catch (error) {
        console.error("Role switch error:", error);
      } finally {
        setIsSwitchingRole(false);
      }
    },
    [user]
  );

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    console.log("Onboarding completed");
  }, []);

  const completeKyc = useCallback(async () => {
    setKycStatus("verified");
    await AsyncStorage.setItem("kycStatus", "verified");
    console.log("KYC completed");
  }, []);

  const isAuthenticated = useMemo(() => user !== null, [user]);
  const isKycVerified = useMemo(() => kycStatus === "verified", [kycStatus]);
  // Capability derives from user.role only — never from activeMode.
  const isDualRole = useMemo(() => user?.role === "both", [user]);
  const canListProperties = useMemo(
    () => user?.role === "host" || user?.role === "both",
    [user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    activeMode,
    hasCompletedOnboarding,
    kycStatus,
    isKycVerified,
    isDualRole,
    canListProperties,
    login,
    loginWithPhone,
    loginWithGoogle,
    loginWithApple,
    logout,
    updateProfile,
    showAuthModal,
    setShowAuthModal,
    authTriggerAction,
    triggerAuth,
    switchRole,
    isSwitchingRole,
    completeOnboarding,
    completeKyc,
  };
});
