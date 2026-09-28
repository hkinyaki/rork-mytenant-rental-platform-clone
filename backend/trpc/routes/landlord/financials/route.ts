import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { store } from "@/backend/trpc/store";

export default publicProcedure
  .input(z.object({ hostId: z.string().optional().default("user-1") }))
  .query(({ input }) => {
    console.log("Fetching financials for host:", input.hostId);

    const activeMonthly = store.tenants
      .filter((t) => t.rentStatus !== "paid" || t.balance === 0)
      .reduce((sum, t) => sum + t.monthlyRent, 0);
    // Seed baseline for months with no recorded payments.
    const baseline = Math.max(activeMonthly, 1350000);

    const monthLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const revenueByMonth = monthLabels.map((label, index) => {
      if (index < monthLabels.length - 1) {
        const variance = [0.92, 1.05, 0.97, 1.0, 0.93][index] ?? 1;
        return { label, revenue: Math.round(baseline * variance) };
      }
      const collected = store.tenants
        .filter((t) => t.rentStatus === "paid")
        .reduce((sum, t) => sum + t.monthlyRent, 0);
      return { label, revenue: Math.max(collected, 900000) };
    });

    const occupancyByMonth = monthLabels.map((label, index) => ({
      label,
      occupancy:
        index === monthLabels.length - 1
          ? Math.round(
              (store.tenants.length /
                Math.max(store.createdProperties.length + 2, store.tenants.length)) *
                100
            )
          : [92, 94, 96, 100, 100][index] ?? 100,
    }));

    const billed = store.tenants.reduce((sum, t) => sum + t.monthlyRent, 0);
    const collected = store.tenants
      .filter((t) => t.rentStatus === "paid")
      .reduce((sum, t) => sum + t.monthlyRent, 0);

    return {
      currency: "TZS",
      totalRevenue: revenueByMonth.reduce((s, m) => s + m.revenue, 0),
      monthlyRevenue: activeMonthly || baseline,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 100,
      outstandingBalance: store.tenants.reduce((sum, t) => sum + t.balance, 0),
      revenueByMonth,
      occupancyByMonth,
      recentPayments: store.tenants
        .filter((t) => t.rentStatus === "paid")
        .map((t) => ({
          id: `payment-${t.id}`,
          tenantName: t.name,
          propertyTitle: t.propertyTitle,
          amount: t.monthlyRent,
          currency: t.currency,
          paidAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        })),
    };
  });
