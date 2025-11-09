import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import dashboardGetRoute from "./routes/dashboard/get/route";
import paymentsListRoute from "./routes/payments/list/route";
import notificationsListRoute from "./routes/notifications/list/route";
import notificationsMarkReadRoute from "./routes/notifications/mark-read/route";
import settingsGetRoute from "./routes/settings/get/route";
import settingsUpdateRoute from "./routes/settings/update/route";
import supportSubmitTicketRoute from "./routes/support/submit-ticket/route";
import supportGetFaqRoute from "./routes/support/get-faq/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  dashboard: createTRPCRouter({
    get: dashboardGetRoute,
  }),
  payments: createTRPCRouter({
    list: paymentsListRoute,
  }),
  notifications: createTRPCRouter({
    list: notificationsListRoute,
    markRead: notificationsMarkReadRoute,
  }),
  settings: createTRPCRouter({
    get: settingsGetRoute,
    update: settingsUpdateRoute,
  }),
  support: createTRPCRouter({
    submitTicket: supportSubmitTicketRoute,
    getFaq: supportGetFaqRoute,
  }),
});

export type AppRouter = typeof appRouter;
