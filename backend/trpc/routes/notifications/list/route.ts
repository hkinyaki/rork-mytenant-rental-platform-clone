import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string()
  }))
  .query(({ input }) => {
    return {
      unreadCount: 3,
      notifications: [
        {
          id: "notif-1",
          type: "payment_reminder" as const,
          title: "Rent Payment Due Soon",
          message: "Your rent payment of TZS 450,000 is due in 3 days",
          propertyTitle: "Modern 2BR Apartment in Masaki",
          isRead: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/payments"
        },
        {
          id: "notif-2",
          type: "maintenance_update" as const,
          title: "Maintenance Request Updated",
          message: "Your maintenance request has been assigned to a technician",
          propertyTitle: "Modern 2BR Apartment in Masaki",
          isRead: false,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/dashboard"
        },
        {
          id: "notif-3",
          type: "utility_bill" as const,
          title: "New Water Bill Available",
          message: "Water bill for January 2024 is ready: TZS 15,000",
          propertyTitle: "Modern 2BR Apartment in Masaki",
          isRead: false,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/payments"
        },
        {
          id: "notif-4",
          type: "message" as const,
          title: "New Message from Host",
          message: "Sarah Johnson sent you a message",
          isRead: true,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/(tabs)/messages"
        },
        {
          id: "notif-5",
          type: "system" as const,
          title: "Profile Verification Complete",
          message: "Your profile has been successfully verified",
          isRead: true,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  });
