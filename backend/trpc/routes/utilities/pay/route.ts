import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ billId: z.string() }))
  .mutation(({ input }) => {
    const bill = store.bills.find((b) => b.id === input.billId);

    if (!bill) {
      throw new Error(`Bill not found: ${input.billId}`);
    }
    if (bill.status === "paid") {
      return { success: false, bill, message: "Bill is already paid" };
    }

    bill.status = "paid";
    bill.paidAt = new Date().toISOString();

    console.log("Bill paid:", bill.id, bill.amountDue, bill.currency);

    return {
      success: true,
      bill,
      message: "Payment recorded successfully",
    };
  });
