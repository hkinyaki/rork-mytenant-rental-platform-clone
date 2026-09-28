import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Map,
  List,
  Heart,
  Star,
  MapPin,
} from "lucide-react-native";
import { useExplore } from "@/contexts/ExploreContext";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { typography, spacing } from "@/constants/typography";
import { Property, ListingType } from "@/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - spacing.md * 2;

export default function ExploreScreen() {
  const router = useRouter();
  const {
    filteredProperties,
    listingType,
    setListingType,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  } = useExplore();
  const { isAuthenticated, triggerAuth } = useAuth();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleWishlistToggle = (propertyId: string) => {
    if (!isAuthenticated) {
      triggerAuth("wishlist");
      return;
    }

    if (isInWishlist(propertyId)) {
      removeFromWishlist(propertyId);
    } else {
      addToWishlist(propertyId);
    }
  };

  const formatPrice = (price: number | undefined, type: ListingType) => {
    if (!price) return "N/A";
    return `KES ${price.toLocaleString()}/${type === "daily" ? "night" : "month"}`;
  };

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/property/${item.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.photos[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => handleWishlistToggle(item.id)}
        >
          <Heart
            size={20}
            color={isInWishlist(item.id) ? Colors.primary : Colors.text}
            fill={isInWishlist(item.id) ? Colors.primary : "transparent"}
          />
        </TouchableOpacity>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.details}>
            {item.bedrooms} bed · {item.bathrooms} bath · {item.guests} guests
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPrice(
              listingType === "daily" ? item.nightlyPrice : item.monthlyPrice,
              listingType === "daily" ? "daily" : "monthly"
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or property name..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.listingTypeToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                listingType === "daily" && styles.toggleButtonActive,
              ]}
              onPress={() => setListingType("daily")}
            >
              <Text
                style={[
                  styles.toggleText,
                  listingType === "daily" && styles.toggleTextActive,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                listingType === "monthly" && styles.toggleButtonActive,
              ]}
              onPress={() => setListingType("monthly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  listingType === "monthly" && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                listingType === "both" && styles.toggleButtonActive,
              ]}
              onPress={() => setListingType("both")}
            >
              <Text
                style={[
                  styles.toggleText,
                  listingType === "both" && styles.toggleTextActive,
                ]}
              >
                Both
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === "list" && styles.viewButtonActive,
              ]}
              onPress={() => setViewMode("list")}
            >
              <List
                size={20}
                color={viewMode === "list" ? Colors.primary : Colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === "map" && styles.viewButtonActive,
              ]}
              onPress={() => setViewMode("map")}
            >
              <Map
                size={20}
                color={viewMode === "map" ? Colors.primary : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {viewMode === "map" && Platform.OS !== "web" ? (
        <View style={styles.mapPlaceholder}>
          <Map size={48} color={Colors.textLight} />
          <Text style={styles.mapText}>Map view coming soon</Text>
          <Text style={styles.mapSubtext}>Switch to list view to browse properties</Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
            </Text>
          </View>

          <FlatList
            data={filteredProperties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <SearchIcon size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>No properties found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: Colors.text,
    padding: 0,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  listingTypeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.text,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: Colors.background,
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
    fontWeight: typography.smallMedium.fontWeight,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  wishlistButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
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
  verifiedBadge: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
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
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.smallMedium.fontWeight,
    color: Colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.sm,
  },
  location: {
    flex: 1,
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  detailsRow: {
    marginBottom: spacing.sm,
  },
  details: {
    fontSize: typography.small.fontSize,
    color: Colors.textSecondary,
  },
  priceRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: spacing.sm,
  },
  price: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: Colors.text,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  mapText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginTop: spacing.md,
  },
  mapSubtext: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: Colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
