import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ hostId: z.string().optional().default("user-1") }))
  .query(({ input }) => {
    const created = store.createdProperties.filter((p) => p.hostId === input.hostId);

    return {
      properties: [
        {
          id: "prop-1",
          title: "Modern 2BR Apartment in Masaki",
          photo: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          occupancyRate: 100,
          monthlyRevenue: 450000,
          activeTenants: 1,
          status: "occupied" as const,
          address: "Masaki, Dar es Salaam",
          bedrooms: 2,
          bathrooms: 2,
        },
        {
          id: "prop-2",
          title: "Luxury 3BR Penthouse - Ocean View",
          photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
          occupancyRate: 100,
          monthlyRevenue: 900000,
          activeTenants: 2,
          status: "occupied" as const,
          address: "Mikocheni, Dar es Salaam",
          bedrooms: 3,
          bathrooms: 3,
        },
        ...created,
      ],
    };
  });
