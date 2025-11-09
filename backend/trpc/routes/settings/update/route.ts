import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    section: z.enum(["account", "notifications", "privacy", "security"]),
    data: z.record(z.string(), z.any())
  }))
  .mutation(({ input }) => {
    console.log("Updating settings:", input.section, input.data);
    return {
      success: true,
      section: input.section,
      message: "Settings updated successfully"
    };
  });
