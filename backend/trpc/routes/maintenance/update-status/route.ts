import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export default publicProcedure
  .input(
    z.object({
      ticketId: z.string(),
      status: z.enum(STATUSES),
    })
  )
  .mutation(({ input }) => {
    const ticket = store.tickets.find((t) => t.id === input.ticketId);

    if (!ticket) {
      throw new Error(`Ticket not found: ${input.ticketId}`);
    }

    ticket.status = input.status;
    ticket.updatedAt = new Date().toISOString();

    console.log("Ticket status updated:", ticket.id, "->", ticket.status);

    return {
      success: true,
      ticket,
    };
  });
