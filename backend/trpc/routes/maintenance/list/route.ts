import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(
    z.object({
      userId: z.string().default("user-1"),
      view: z.enum(["tenant", "landlord"]).default("tenant"),
    })
  )
  .query(({ input }) => {
    const tickets = store.tickets
      .filter((t) => (input.view === "landlord" ? true : t.createdBy === input.userId))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return {
      tickets,
      summary: {
        open: tickets.filter((t) => t.status === "open").length,
        inProgress: tickets.filter((t) => t.status === "in_progress").length,
        resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      },
    };
  });
