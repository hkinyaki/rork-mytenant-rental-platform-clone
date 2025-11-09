import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Shield,
  MessageCircle,
  Calendar,
} from "lucide-react-native";
import { useExplore } from "@/contexts/ExploreContext";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { properties, isInWishlist, addToWishlist, removeFromWishlist } = useExplore();
  const { isAuthenticated, triggerAuth } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      triggerAuth("wishlist");
      return;
    }

    if (isInWishlist(property.id)) {
      removeFromWishlist(property.id);
    } else {
      addToWishlist(property.id);
    }
  };

  const handleContactHost = () => {
    if (!isAuthenticated) {
      triggerAuth("message");
      return;
    }
    console.log("Contact host");
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      triggerAuth("booking");
      return;
    }
    router.push(`/booking/${property.id}` as any);
  };

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {property.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.imageIndicators}>
            {property.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  activeImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWishlistToggle}
            >
              <Heart
                size={20}
                color={isInWishlist(property.id) ? Colors.primary : Colors.text}
                fill={isInWishlist(property.id) ? Colors.primary : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>{property.title}</Text>
              {property.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Shield size={14} color={Colors.background} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.ratingRow}>
              <Star size={16} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.rating}>{property.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>
                ({property.reviewCount} {property.reviewCount === 1 ? "review" : "reviews"})
              </Text>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.location}>{property.address}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Bed size={20} color={Colors.text} />
                <Text style={styles.detailText}>{property.bedrooms} Bedrooms</Text>
              </View>
              <View style={styles.detailItem}>
                <Bath size={20} color={Colors.text} />
                <Text style={styles.detailText}>{property.bathrooms} Bathrooms</Text>
              </View>
              <View style={styles.detailItem}>
                <Users size={20} color={Colors.text} />
                <Text style={styles.detailText}>{property.guests} Guests</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <View key={index} style={styles.amenityItem}>
                    <Icon size={18} color={Colors.text} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Host Information</Text>
            <View style={styles.hostCard}>
              <Image
                source={{ uri: property.hostPhoto }}
                style={styles.hostPhoto}
                contentFit="cover"
              />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{property.hostName}</Text>
                <View style={styles.hostRating}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.hostRatingText}>
                    {property.hostRating.toFixed(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleContactHost}
              >
                <MessageCircle size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            KES {(property.nightlyPrice || property.monthlyPrice || 0).toLocaleString()}
          </Text>
          <Text style={styles.priceLabel}>
            /{property.nightlyPrice ? "night" : "month"}
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Calendar size={20} color={Colors.background} />
          <Text style={styles.bookButtonText}>
            {property.listingType === "daily" ? "Book Now" : "Schedule Inspection"}
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
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 400,
    position: "relative",
  },
  galleryImage: {
    width: width,
    height: 400,
  },
  imageIndicators: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: Colors.background,
    width: 20,
  },
  backIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  imageActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: Colors.text,
    marginRight: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.badge.verified,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    color: Colors.background,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.captionBold.fontWeight,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  rating: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  detailText: {
    fontSize: typography.body.fontSize,
    color: Colors.text,
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight * 1.5,
    color: Colors.text,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: "45%",
  },
  amenityText: {
    fontSize: typography.small.fontSize,
    color: Colors.text,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
  },
  hostPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  hostRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hostRatingText: {
    fontSize: typography.small.fontSize,
    color: Colors.text,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    height: 100,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
  },
  priceLabel: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
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
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.h3.fontSize,
    color: Colors.text,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodySemibold.fontWeight,
  },
});
