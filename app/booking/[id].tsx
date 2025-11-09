import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Calendar, Clock, CreditCard, Shield, Check } from "lucide-react-native";
import { useExplore } from "@/contexts/ExploreContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { properties } = useExplore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const isMonthly = property.listingType === "monthly" || property.monthlyPrice;

  const handleBooking = async () => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (isMonthly && !selectedTime) {
      Alert.alert("Error", "Please select an inspection time");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    Alert.alert(
      "Success",
      isMonthly
        ? "Your inspection has been scheduled. The host will confirm shortly."
        : "Your booking has been confirmed! Check your messages for details.",
      [{ text: "OK", onPress: () => router.back() }]
    );

    setIsLoading(false);
  };

  const inspectionSlots = [
    "09:00 AM",
    "11:00 AM",
    "02:00 PM",
    "04:00 PM",
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle: isMonthly ? "Schedule Inspection" : "Book Property",
          headerShown: true,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.propertyCard}>
          <Image
            source={{ uri: property.photos[0] }}
            style={styles.propertyImage}
            contentFit="cover"
          />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {property.title}
            </Text>
            <Text style={styles.propertyLocation} numberOfLines={1}>
              {property.address}
            </Text>
            <Text style={styles.propertyPrice}>
              KES{" "}
              {(isMonthly
                ? property.monthlyPrice
                : property.nightlyPrice
              )?.toLocaleString()}
              /{isMonthly ? "month" : "night"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {isMonthly ? "Inspection Date" : "Booking Date"}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder={isMonthly ? "Select inspection date" : "Select check-in date"}
            placeholderTextColor={Colors.textLight}
            value={selectedDate}
            onChangeText={setSelectedDate}
          />

          {isMonthly && (
            <>
              <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
                <Clock size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Preferred Time</Text>
              </View>

              <View style={styles.timeSlots}>
                {inspectionSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      selectedTime === slot && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === slot && styles.timeSlotTextSelected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests or questions?"
            placeholderTextColor={Colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {!isMonthly && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <TouchableOpacity style={styles.paymentOption}>
              <View style={styles.paymentOptionContent}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={20} color={Colors.text} />
                </View>
                <View style={styles.paymentText}>
                  <Text style={styles.paymentLabel}>M-Pesa</Text>
                  <Text style={styles.paymentDescription}>
                    Pay securely with M-Pesa
                  </Text>
                </View>
              </View>
              <View style={styles.radioSelected}>
                <View style={styles.radioDot} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={Colors.success} />
            <Text style={styles.sectionTitle}>Booking Protection</Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Check size={18} color={Colors.success} />
              <Text style={styles.infoText}>
                {isMonthly
                  ? "Free cancellation up to 24 hours before inspection"
                  : "Full refund if host cancels"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Check size={18} color={Colors.success} />
              <Text style={styles.infoText}>
                Secure payment through escrow
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Check size={18} color={Colors.success} />
              <Text style={styles.infoText}>24/7 customer support</Text>
            </View>
          </View>
        </View>

        {!isMonthly && (
          <View style={styles.priceBreakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                KES {property.nightlyPrice?.toLocaleString()} × 1 night
              </Text>
              <Text style={styles.breakdownValue}>
                KES {property.nightlyPrice?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service fee</Text>
              <Text style={styles.breakdownValue}>KES 500</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>Total</Text>
              <Text style={styles.breakdownTotalValue}>
                KES {((property.nightlyPrice || 0) + 500).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.bookButtonText}>
              {isMonthly ? "Schedule Inspection" : "Confirm Booking"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGray,
    margin: spacing.md,
    borderRadius: 12,
    overflow: "hidden",
  },
  propertyImage: {
    width: 120,
    height: 120,
  },
  propertyInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  propertyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlot: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: typography.body.fontSize,
    color: Colors.text,
    fontWeight: typography.bodyMedium.fontWeight,
  },
  timeSlotTextSelected: {
    color: Colors.background,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: spacing.md,
  },
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  paymentText: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  infoBox: {
    backgroundColor: Colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.small.fontSize,
    color: Colors.text,
    lineHeight: typography.small.lineHeight * 1.4,
  },
  priceBreakdown: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: Colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
  },
  breakdownTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: typography.body.fontSize,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: spacing.sm,
  },
  breakdownTotalLabel: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
  },
  breakdownTotalValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.primary,
  },
  spacer: {
    height: 80,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  bookButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: typography.h3.fontSize,
    color: Colors.text,
  },
});
