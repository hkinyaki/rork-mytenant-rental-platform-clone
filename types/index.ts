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

export interface Payment {
  id: string;
  type: "rent_payment" | "utility_payment" | "deposit" | "refund";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "held";
  propertyTitle: string;
  description?: string;
  method: string;
  date: string;
  receiptUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: "mpesa" | "card" | "bank" | "airtel_money";
  phoneNumber?: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  addedAt: string;
}

export interface Notification {
  id: string;
  type: "payment_reminder" | "maintenance_update" | "utility_bill" | "message" | "system";
  title: string;
  message: string;
  propertyTitle?: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface UserSettings {
  account: {
    name: string;
    email: string;
    phone: string;
    language: string;
    currency: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    paymentReminders: boolean;
    maintenanceUpdates: boolean;
    messages: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "contacts_only";
    showEmail: boolean;
    showPhone: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    lastPasswordChange: string;
  };
  devices: Device[];
}

export interface Device {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: "account" | "payment" | "property" | "technical" | "other";
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  faqs: FAQ[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
