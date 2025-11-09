import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    subject: z.string(),
    category: z.enum(["account", "payment", "property", "technical", "other"]),
    message: z.string(),
    attachments: z.array(z.string()).optional()
  }))
  .mutation(({ input }) => {
    console.log("New support ticket:", input);
    return {
      success: true,
      ticketId: `ticket-${Date.now()}`,
      message: "Support ticket submitted successfully. We'll respond within 24 hours."
    };
  });
