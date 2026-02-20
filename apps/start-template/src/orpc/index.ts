import type { RouterClient } from "@orpc/server";

import { orpc } from "./orpc-server";

import { chatRouter } from "./routes/chat";
import { dashboardRouter } from "./routes/dashboard";
import { organizationRouter } from "./routes/organization";
import { profileRouter } from "./routes/profile";
import { storageRouter } from "./routes/storage";

export const router = orpc.router({
  profile: profileRouter,
  organization: organizationRouter,
  dashboard: dashboardRouter,
  storage: storageRouter,
  chat: chatRouter,
});

export type AppRouter = typeof router;
export type AppRouterClient = RouterClient<typeof router>;
