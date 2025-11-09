import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { MOCK_CURRENT_USER } from "@/mocks/users";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextValue>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTriggerAction, setAuthTriggerAction] = useState<string | null>(null);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const authenticatedUser = { ...MOCK_CURRENT_USER, email };
      setUser(authenticatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(authenticatedUser));
      setShowAuthModal(false);
      console.log("User logged in:", email);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPhone = useCallback(async (phone: string, otp?: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const authenticatedUser = { ...MOCK_CURRENT_USER, phone };
      setUser(authenticatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(authenticatedUser));
      setShowAuthModal(false);
      console.log("User logged in with phone:", phone);
    } catch (error) {
      console.error("Phone login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser(MOCK_CURRENT_USER);
      await AsyncStorage.setItem("user", JSON.stringify(MOCK_CURRENT_USER));
      setShowAuthModal(false);
      console.log("User logged in with Google");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser(MOCK_CURRENT_USER);
      await AsyncStorage.setItem("user", JSON.stringify(MOCK_CURRENT_USER));
      setShowAuthModal(false);
      console.log("User logged in with Apple");
    } catch (error) {
      console.error("Apple login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
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

  const isAuthenticated = useMemo(() => user !== null, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
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
  };
});
