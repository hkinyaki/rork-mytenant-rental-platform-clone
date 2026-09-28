import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store, nextId } from "@/backend/trpc/store";

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      propertyId: z.string().min(1),
      propertyTitle: z.string().min(1),
      title: z.string().min(3),
      description: z.string().min(5),
      priority: z.enum(["low", "medium", "high"]),
      photos: z.array(z.string()).default([]),
    })
  )
  .mutation(({ input }) => {
    const ticket = {
      id: nextId("ticket"),
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      createdBy: input.userId,
      title: input.title,
      description: input.description,
      photos: input.photos,
      status: "open" as const,
      priority: input.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.tickets.unshift(ticket);
    console.log("Maintenance ticket created:", ticket.id, "photos:", ticket.photos.length);

    return {
      success: true,
      ticketId: ticket.id,
      ticket,
    };
  });
