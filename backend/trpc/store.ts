/**
 * In-memory store backing the mock backend. Serverless instances may reset
 * between deploys, but within a running server mutations persist across
 * requests — enough to verify end-to-end state persistence until a real
 * database lands.
 */

const iso = (daysOffset: number) =>
  new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

export interface StoreTenant {
  id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  unit: string;
  monthlyRent: number;
  currency: string;
  leaseStart: string;
  leaseEnd: string;
  rentStatus: "paid" | "due" | "overdue";
  balance: number;
  kycStatus: "verified" | "pending" | "rejected";
}

export interface StoreTicket {
  id: string;
  propertyTitle: string;
  propertyId: string;
  createdBy: string;
  title: string;
  description: string;
  photos: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface StoreBill {
  id: string;
  propertyTitle: string;
  type: "water" | "electricity" | "internet" | "garbage";
  amountDue: number;
  currency: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  paidAt: string | null;
}

export interface StoreMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments: string[];
  timestamp: string;
  isRead: boolean;
}

export interface StoreConversation {
  id: string;
  propertyId: string | null;
  propertyTitle: string | null;
  participantId: string;
  participantName: string;
  participantPhoto: string;
  type: "booking" | "property" | "maintenance" | "support";
  messages: StoreMessage[];
}

export const store = {
  createdProperties: [] as {
    id: string;
    hostId: string;
    title: string;
    photo: string;
    occupancyRate: number;
    monthlyRevenue: number;
    activeTenants: number;
    status: "vacant" | "occupied";
    address: string;
    bedrooms: number;
    bathrooms: number;
  }[],

  tenants: [
    {
      id: "tenant-1",
      name: "Grace Wanjiru",
      photo: "https://i.pravatar.cc/150?img=45",
      phone: "+254722112233",
      email: "grace.w@example.com",
      propertyId: "prop-1",
      propertyTitle: "Modern 2BR Apartment in Masaki",
      unit: "A1",
      monthlyRent: 450000,
      currency: "TZS",
      leaseStart: iso(-320),
      leaseEnd: iso(45),
      rentStatus: "due",
      balance: 450000,
      kycStatus: "verified",
    },
    {
      id: "tenant-2",
      name: "David Ochieng",
      photo: "https://i.pravatar.cc/150?img=12",
      phone: "+254733445566",
      email: "david.o@example.com",
      propertyId: "prop-2",
      propertyTitle: "Luxury 3BR Penthouse - Ocean View",
      unit: "P1",
      monthlyRent: 900000,
      currency: "TZS",
      leaseStart: iso(-150),
      leaseEnd: iso(215),
      rentStatus: "paid",
      balance: 0,
      kycStatus: "verified",
    },
    {
      id: "tenant-3",
      name: "Amina Hassan",
      photo: "https://i.pravatar.cc/150?img=32",
      phone: "+254701998877",
      email: "amina.h@example.com",
      propertyId: "prop-2",
      propertyTitle: "Luxury 3BR Penthouse - Ocean View",
      unit: "P2",
      monthlyRent: 900000,
      currency: "TZS",
      leaseStart: iso(-400),
      leaseEnd: iso(-10),
      rentStatus: "overdue",
      balance: 1800000,
      kycStatus: "pending",
    },
  ] as StoreTenant[],

  tickets: [
    {
      id: "ticket-1",
      propertyTitle: "Modern 2BR Apartment in Masaki",
      propertyId: "prop-1",
      createdBy: "user-1",
      title: "Leaking kitchen faucet",
      description: "The kitchen faucet drips constantly and the cabinet below is getting wet.",
      photos: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600"],
      status: "in_progress",
      priority: "medium",
      createdAt: iso(-2),
      updatedAt: iso(-1),
    },
  ] as StoreTicket[],

  bills: [
    {
      id: "bill-1",
      propertyTitle: "Modern 2BR Apartment in Masaki",
      type: "water",
      amountDue: 15000,
      currency: "TZS",
      dueDate: iso(7),
      status: "pending",
      paidAt: null,
    },
    {
      id: "bill-2",
      propertyTitle: "Modern 2BR Apartment in Masaki",
      type: "electricity",
      amountDue: 32000,
      currency: "TZS",
      dueDate: iso(-2),
      status: "overdue",
      paidAt: null,
    },
    {
      id: "bill-3",
      propertyTitle: "Luxury 3BR Penthouse - Ocean View",
      type: "internet",
      amountDue: 25000,
      currency: "TZS",
      dueDate: iso(-5),
      status: "paid",
      paidAt: iso(-6),
    },
  ] as StoreBill[],

  conversations: [
    {
      id: "conv-1",
      propertyId: "prop-1",
      propertyTitle: "Modern 2BR Apartment in Masaki",
      participantId: "host-1",
      participantName: "Sarah Johnson",
      participantPhoto: "https://i.pravatar.cc/150?img=1",
      type: "property",
      messages: [
        {
          id: "msg-1",
          senderId: "user-1",
          senderName: "Alex Maina",
          text: "Hi! Is the Masaki apartment still available for a 12-month lease?",
          attachments: [],
          timestamp: iso(-1),
          isRead: true,
        },
        {
          id: "msg-2",
          senderId: "host-1",
          senderName: "Sarah Johnson",
          text: "Yes it is! Would you like to schedule a viewing this week?",
          attachments: [],
          timestamp: iso(-0.5),
          isRead: true,
        },
      ],
    },
  ] as StoreConversation[],
};

export const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
