import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    role: z.enum(["tenant", "landlord"]).default("tenant")
  }))
  .query(({ input }) => {
    if (input.role === "tenant") {
      return {
        role: "tenant" as const,
        stats: {
          walletBalance: 250000,
          currency: "TZS",
          rentDue: {
            amount: 450000,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            daysUntilDue: 3,
            propertyTitle: "Modern 2BR Apartment in Masaki"
          },
          activeBookings: 1,
          maintenanceActive: 1,
          upcomingPayments: 1
        },
        recentBookings: [
          {
            id: "booking-1",
            propertyTitle: "Modern 2BR Apartment in Masaki",
            propertyPhoto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyAmount: 450000,
            status: "confirmed" as const,
            nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        maintenanceTickets: [
          {
            id: "ticket-1",
            propertyTitle: "Modern 2BR Apartment in Masaki",
            description: "Leaking kitchen faucet needs repair",
            status: "in_progress" as const,
            priority: "medium" as const,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        utilityBills: [
          {
            id: "bill-1",
            propertyTitle: "Modern 2BR Apartment in Masaki",
            type: "water",
            amountDue: 15000,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending" as const
          }
        ]
      };
    } else {
      return {
        role: "landlord" as const,
        stats: {
          totalRevenue: 3450000,
          currency: "TZS",
          monthlyRevenue: 1350000,
          activeProperties: 3,
          activeTenants: 5,
          pendingApplications: 2,
          maintenanceRequests: 1,
          upcomingInspections: 1
        },
        properties: [
          {
            id: "prop-1",
            title: "Modern 2BR Apartment in Masaki",
            photo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            occupancyRate: 100,
            monthlyRevenue: 450000,
            activeTenants: 1,
            status: "occupied" as const
          },
          {
            id: "prop-2",
            title: "Luxury 3BR Penthouse - Ocean View",
            photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            occupancyRate: 100,
            monthlyRevenue: 900000,
            activeTenants: 1,
            status: "occupied" as const
          }
        ],
        recentApplications: [
          {
            id: "app-1",
            tenantName: "John Doe",
            tenantPhoto: "https://i.pravatar.cc/150?img=12",
            propertyTitle: "Cozy Studio in Mikocheni",
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending" as const
          },
          {
            id: "app-2",
            tenantName: "Jane Smith",
            tenantPhoto: "https://i.pravatar.cc/150?img=45",
            propertyTitle: "Modern 2BR Apartment in Masaki",
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending" as const
          }
        ],
        upcomingInspections: [
          {
            id: "insp-1",
            propertyTitle: "Cozy Studio in Mikocheni",
            tenantName: "Michael Brown",
            inspectionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "scheduled" as const
          }
        ]
      };
    }
  });
