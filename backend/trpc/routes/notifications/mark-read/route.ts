import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    notificationId: z.string()
  }))
  .mutation(({ input }) => {
    console.log("Marking notification as read:", input.notificationId);
    return {
      success: true,
      notificationId: input.notificationId
    };
  });
