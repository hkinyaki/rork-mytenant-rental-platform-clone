import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ hostId: z.string().optional().default("user-1") }))
  .query(({ input }) => {
    console.log("Fetching tenant directory for host:", input.hostId);

    return {
      tenants: store.tenants.map((tenant) => ({
        ...tenant,
        onTimeRate: tenant.rentStatus === "paid" ? 100 : tenant.rentStatus === "overdue" ? 72 : 95,
      })),
      summary: {
        totalTenants: store.tenants.length,
        withBalance: store.tenants.filter((t) => t.balance > 0).length,
        totalBalance: store.tenants.reduce((sum, t) => sum + t.balance, 0),
        currency: "TZS",
      },
    };
  });
