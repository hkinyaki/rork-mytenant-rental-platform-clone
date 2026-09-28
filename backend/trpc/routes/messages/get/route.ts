import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ conversationId: z.string() }))
  .query(({ input }) => {
    const conversation = store.conversations.find(
      (c) => c.id === input.conversationId
    );

    if (!conversation) {
      throw new Error(`Conversation not found: ${input.conversationId}`);
    }

    return { conversation };
  });
