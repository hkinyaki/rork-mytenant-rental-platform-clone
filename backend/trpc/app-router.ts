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
import propertiesListRoute from "./routes/properties/list/route";
import propertiesCreateRoute from "./routes/properties/create/route";
import landlordTenantsRoute from "./routes/landlord/tenants/route";
import landlordFinancialsRoute from "./routes/landlord/financials/route";
import maintenanceListRoute from "./routes/maintenance/list/route";
import maintenanceCreateRoute from "./routes/maintenance/create/route";
import maintenanceUpdateStatusRoute from "./routes/maintenance/update-status/route";
import utilitiesListRoute from "./routes/utilities/list/route";
import utilitiesPayRoute from "./routes/utilities/pay/route";
import messagesConversationsRoute from "./routes/messages/conversations/route";
import messagesGetRoute from "./routes/messages/get/route";
import messagesSendRoute from "./routes/messages/send/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  dashboard: createTRPCRouter({
    get: dashboardGetRoute,
  }),
  properties: createTRPCRouter({
    list: propertiesListRoute,
    create: propertiesCreateRoute,
  }),
  landlord: createTRPCRouter({
    tenants: landlordTenantsRoute,
    financials: landlordFinancialsRoute,
  }),
  maintenance: createTRPCRouter({
    list: maintenanceListRoute,
    create: maintenanceCreateRoute,
    updateStatus: maintenanceUpdateStatusRoute,
  }),
  utilities: createTRPCRouter({
    list: utilitiesListRoute,
    pay: utilitiesPayRoute,
  }),
  messages: createTRPCRouter({
    conversations: messagesConversationsRoute,
    get: messagesGetRoute,
    send: messagesSendRoute,
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
