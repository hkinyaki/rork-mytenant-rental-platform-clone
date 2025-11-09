import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string()
  }))
  .query(({ input }) => {
    return {
      account: {
        name: "Alex Maina",
        email: "alex.maina@example.com",
        phone: "+254712345678",
        language: "en",
        currency: "TZS"
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        paymentReminders: true,
        maintenanceUpdates: true,
        messages: true,
        marketing: false
      },
      privacy: {
        profileVisibility: "public" as const,
        showEmail: false,
        showPhone: false
      },
      security: {
        twoFactorEnabled: false,
        biometricEnabled: true,
        lastPasswordChange: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      devices: [
        {
          id: "device-1",
          name: "iPhone 14 Pro",
          type: "mobile",
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isCurrent: true
        },
        {
          id: "device-2",
          name: "Chrome on Windows",
          type: "web",
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isCurrent: false
        }
      ]
    };
  });
