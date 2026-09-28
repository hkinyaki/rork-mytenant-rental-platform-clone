import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Home, ShieldCheck, LayoutDashboard } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "discover",
    title: "Find your next home",
    description:
      "Browse verified apartments, houses and rooms for daily or monthly stays — all in one place.",
    icon: Home,
  },
  {
    id: "trust",
    title: "Verified hosts & tenants",
    description:
      "Every user completes ID and selfie verification, so you always know who you're dealing with.",
    icon: ShieldCheck,
  },
  {
    id: "manage",
    title: "Rent, made simple",
    description:
      "Pay rent, split utility bills, track payments and raise maintenance requests in a few taps.",
    icon: LayoutDashboard,
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const pagerRef = useRef<ScrollView>(null);
  const isLast = pageIndex === SLIDES.length - 1;

  const finish = async () => {
    await completeOnboarding();
    // Re-run the gate ladder: it will route to /auth next since we're signed out.
    router.replace("/");
  };

  const goToPage = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    pagerRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (index !== pageIndex && index >= 0 && index < SLIDES.length) {
      setPageIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.skipButton} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.pager}
      >
        {SLIDES.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.iconCircle}>
                <Icon size={64} color={Colors.primary} />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
              <Text style={styles.stepLabel}>
                {index + 1} of {SLIDES.length}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, index === pageIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => (isLast ? finish() : goToPage(pageIndex + 1))}
        >
          <Text style={styles.primaryButtonText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipText: {
    fontSize: typography.smallMedium.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.textSecondary,
  },
  pager: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.backgroundGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: Colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  stepLabel: {
    fontSize: typography.caption.fontSize,
    color: Colors.textLight,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: typography.bodySemibold.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
});
