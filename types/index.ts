export type PropertyType = "apartment" | "house" | "studio" | "villa" | "room";
export type ListingType = "daily" | "monthly" | "both";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type UserRole = "tenant" | "host" | "both";
export type KYCStatus = "pending" | "verified" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  role: UserRole;
  kycStatus?: KYCStatus;
  tinNumber?: string;
  rating?: number;
  reviewCount?: number;
  joinedDate: string;
}

export interface Property {
  id: string;
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  hostRating: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  photos: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  nightlyPrice?: number;
  monthlyPrice?: number;
  minLeaseMonths?: number;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPhoto: string;
  tenantId: string;
  hostId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  escrowStatus: "pending" | "held" | "released" | "refunded";
  inspectionDate?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  attachments?: string[];
  quickActions?: QuickAction[];
  timestamp: string;
  isRead: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  params?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPhoto?: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  type: "booking" | "property" | "maintenance" | "support";
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyTitle: string;
  createdBy: string;
  description: string;
  photos: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  propertyTitle: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amountDue: number;
  shared: boolean;
  splitAmount?: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  paidAt?: string;
}

export interface FilterOptions {
  propertyType?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  verifiedOnly?: boolean;
}
