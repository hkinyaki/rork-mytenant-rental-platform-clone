import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store, nextId } from "@/backend/trpc/store";

export default publicProcedure
  .input(
    z.object({
      hostId: z.string(),
      title: z.string().min(3),
      address: z.string().min(3),
      propertyType: z.enum(["apartment", "house", "studio", "villa", "room"]),
      listingType: z.enum(["daily", "monthly", "both"]),
      monthlyPrice: z.number().positive(),
      bedrooms: z.number().int().min(0),
      bathrooms: z.number().int().min(0),
      guests: z.number().int().min(1),
      description: z.string().optional(),
      amenities: z.array(z.string()).default([]),
      photoUrl: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const property = {
      id: nextId("prop"),
      hostId: input.hostId,
      title: input.title,
      photo:
        input.photoUrl ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      occupancyRate: 0,
      monthlyRevenue: 0,
      activeTenants: 0,
      status: "vacant" as const,
      address: input.address,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
    };

    store.createdProperties.push(property);

    console.log("Property created:", property.id, input.title);

    return {
      success: true,
      propertyId: property.id,
      property,
    };
  });
