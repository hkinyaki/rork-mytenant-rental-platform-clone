import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Property, FilterOptions, ListingType } from "@/types";
import { MOCK_PROPERTIES } from "@/mocks/properties";

interface ExploreContextValue {
  properties: Property[];
  filteredProperties: Property[];
  listingType: ListingType;
  setListingType: (type: ListingType) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  viewMode: "map" | "list";
  setViewMode: (mode: "map" | "list") => void;
  wishlist: string[];
  addToWishlist: (propertyId: string) => void;
  removeFromWishlist: (propertyId: string) => void;
  isInWishlist: (propertyId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const WISHLIST_KEY = "mytenant_wishlist";

export const [ExploreProvider, useExplore] = createContextHook<ExploreContextValue>(() => {
  const [properties] = useState<Property[]>(MOCK_PROPERTIES);
  const [listingType, setListingType] = useState<ListingType>("both");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    AsyncStorage.getItem(WISHLIST_KEY).then((stored) => {
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    });
  }, []);

  const addToWishlist = useCallback(async (propertyId: string) => {
    setWishlist((prev) => {
      const updated = [...prev, propertyId];
      AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
    console.log("Added to wishlist:", propertyId);
  }, []);

  const removeFromWishlist = useCallback(async (propertyId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== propertyId);
      AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
    console.log("Removed from wishlist:", propertyId);
  }, []);

  const isInWishlist = useCallback(
    (propertyId: string) => {
      return wishlist.includes(propertyId);
    },
    [wishlist]
  );

  const filteredProperties = properties.filter((property) => {
    if (listingType !== "both" && property.listingType !== "both") {
      if (property.listingType !== listingType) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !property.title.toLowerCase().includes(query) &&
        !property.address.toLowerCase().includes(query) &&
        !property.city.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (filters.propertyType && filters.propertyType.length > 0) {
      if (!filters.propertyType.includes(property.propertyType)) return false;
    }

    if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
      return false;
    }

    if (filters.bathrooms && property.bathrooms < filters.bathrooms) {
      return false;
    }

    const price = listingType === "daily" ? property.nightlyPrice : property.monthlyPrice;
    if (filters.priceMin && price && price < filters.priceMin) {
      return false;
    }

    if (filters.priceMax && price && price > filters.priceMax) {
      return false;
    }

    if (filters.amenities && filters.amenities.length > 0) {
      if (!filters.amenities.every((amenity) => property.amenities.includes(amenity))) {
        return false;
      }
    }

    if (filters.verifiedOnly && !property.isVerified) {
      return false;
    }

    return true;
  });

  return {
    properties,
    filteredProperties,
    listingType,
    setListingType,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    searchQuery,
    setSearchQuery,
  };
});
