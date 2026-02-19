import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { organization } from "@/lib/db/schema";

import { orpc, protectedProcedure } from "../orpc-server";

export const organizationRouter = orpc.router({
  getFullOrganizationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(
      async ({ input, context }) =>
        await context.db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            createdAt: organization.createdAt,
          })
          .from(organization)
          .where(eq(organization.id, input.id))
    ),
  getOrganizationsFromIdList: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .handler(
      async ({ input, context }) =>
        await context.db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            createdAt: organization.createdAt,
          })
          .from(organization)
          .where(inArray(organization.id, input.ids))
    ),
});
