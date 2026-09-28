import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store, nextId } from "@/backend/trpc/store";

export default publicProcedure
  .input(
    z.object({
      conversationId: z.string(),
      senderId: z.string(),
      senderName: z.string(),
      text: z.string().min(1).max(2000),
      attachments: z.array(z.string()).default([]),
    })
  )
  .mutation(({ input }) => {
    const conversation = store.conversations.find(
      (c) => c.id === input.conversationId
    );

    if (!conversation) {
      throw new Error(`Conversation not found: ${input.conversationId}`);
    }

    const message = {
      id: nextId("msg"),
      senderId: input.senderId,
      senderName: input.senderName,
      text: input.text,
      attachments: input.attachments,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    conversation.messages.push(message);

    return {
      success: true,
      message,
    };
  });
