import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ userId: z.string().default("user-1") }))
  .query(({ input }) => {
    console.log("Fetching utility bills for:", input.userId);

    const pending = store.bills.filter((b) => b.status !== "paid");
    const paid = store.bills.filter((b) => b.status === "paid");

    return {
      bills: store.bills,
      summary: {
        outstanding: pending.reduce((sum, b) => sum + b.amountDue, 0),
        overdueCount: store.bills.filter((b) => b.status === "overdue").length,
        paidThisMonth: paid.reduce((sum, b) => sum + b.amountDue, 0),
        currency: "TZS",
      },
    };
  });
