import { passkeyClient } from "@better-auth/passkey/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { APP_CONFIG } from "../config/app.config";
import {
  ac,
  admin as adminRole,
  member as memberRole,
  owner as ownerRole,
  superAdmin as superAdminRole,
  user as userRole,
} from "./permissions";

export const authClient = createAuthClient({
  appName: APP_CONFIG.name,
  plugins: [
    twoFactorClient(),
    lastLoginMethodClient(),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        owner: ownerRole,
        super_admin: superAdminRole,
      },
    }),
    emailOTPClient(),
    magicLinkClient(),
    multiSessionClient(),
    organizationClient({
      ac,
      roles: {
        owner: ownerRole,
        admin: adminRole,
        member: memberRole,
      },
    }),
    stripeClient({ subscription: true }),
  ],
});

export type AuthClient = ReturnType<typeof createAuthClient>;
export type AuthSession = ReturnType<
  typeof createAuthClient
>["$Infer"]["Session"];
