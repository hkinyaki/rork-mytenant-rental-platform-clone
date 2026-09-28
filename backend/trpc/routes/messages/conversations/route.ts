import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ userId: z.string().default("user-1") }))
  .query(({ input }) => {
    console.log("Fetching conversations for:", input.userId);

    const conversations = store.conversations
      .map((conversation) => {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1] ?? null;
        return {
          id: conversation.id,
          propertyId: conversation.propertyId,
          propertyTitle: conversation.propertyTitle,
          participantId: conversation.participantId,
          participantName: conversation.participantName,
          participantPhoto: conversation.participantPhoto,
          type: conversation.type,
          lastMessage,
          unreadCount: conversation.messages.filter(
            (m) => !m.isRead && m.senderId !== input.userId
          ).length,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage?.timestamp ?? "";
        const bTime = b.lastMessage?.timestamp ?? "";
        return aTime < bTime ? 1 : -1;
      });

    return { conversations };
  });
