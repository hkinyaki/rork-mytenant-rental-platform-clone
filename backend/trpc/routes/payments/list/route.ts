import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string()
  }))
  .query(({ input }) => {
    return {
      paymentMethods: [
        {
          id: "pm-1",
          type: "mpesa" as "mpesa" | "airtel_money" | "card" | "bank",
          phoneNumber: "+254712345678",
          isDefault: true,
          addedAt: "2024-01-15"
        },
        {
          id: "pm-2",
          type: "card" as "mpesa" | "airtel_money" | "card" | "bank",
          last4: "4242",
          brand: "Visa",
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: false,
          addedAt: "2024-02-20"
        },
        {
          id: "pm-3",
          type: "airtel_money" as "mpesa" | "airtel_money" | "card" | "bank",
          phoneNumber: "+255754321987",
          isDefault: false,
          addedAt: "2024-03-10"
        }
      ],
      transactions: [
        {
          id: "tx-1",
          type: "rent_payment" as const,
          amount: 450000,
          currency: "TZS",
          status: "completed" as const,
          propertyTitle: "Modern 2BR Apartment in Masaki",
          method: "M-Pesa",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          receiptUrl: "#"
        },
        {
          id: "tx-2",
          type: "utility_payment" as const,
          amount: 15000,
          currency: "TZS",
          status: "completed" as const,
          propertyTitle: "Modern 2BR Apartment in Masaki",
          description: "Water bill - January 2024",
          method: "M-Pesa",
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          receiptUrl: "#"
        },
        {
          id: "tx-3",
          type: "deposit" as const,
          amount: 900000,
          currency: "TZS",
          status: "held" as const,
          propertyTitle: "Modern 2BR Apartment in Masaki",
          description: "Security deposit (2 months)",
          method: "Card",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          receiptUrl: "#"
        },
        {
          id: "tx-4",
          type: "rent_payment" as const,
          amount: 450000,
          currency: "TZS",
          status: "completed" as const,
          propertyTitle: "Modern 2BR Apartment in Masaki",
          method: "M-Pesa",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          receiptUrl: "#"
        }
      ],
      summary: {
        totalSpent: 1815000,
        currency: "TZS",
        thisMonth: 465000,
        lastMonth: 450000,
        depositsHeld: 900000
      }
    };
  });
