import { and, eq, inArray } from "drizzle-orm";
import z from "zod";

import { member, organization } from "@/lib/db/schema";

import { ORPCError } from "@orpc/server";
import { orpc, protectedProcedure } from "../orpc-server";

export const organizationRouter = orpc.router({
  getFullOrganizationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Verify user is a member of this organization
      const membership = await context.db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id),
          eq(member.organizationId, input.id),
        ),
      });
      if (!membership) {
        throw new ORPCError("FORBIDDEN", {
          message: "Not a member of this organization",
        });
      }

      return await context.db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
        })
        .from(organization)
        .where(eq(organization.id, input.id));
    }),
  getOrganizationsFromIdList: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .handler(async ({ input, context }) => {
      if (input.ids.length === 0) return [];

      // Filter to only organizations the user is a member of
      const memberships = await context.db
        .select({ organizationId: member.organizationId })
        .from(member)
        .where(
          and(
            eq(member.userId, context.session.user.id),
            inArray(member.organizationId, input.ids),
          ),
        );
      const allowedIds = memberships.map((m) => m.organizationId);

      if (allowedIds.length === 0) return [];

      return await context.db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
        })
        .from(organization)
        .where(inArray(organization.id, allowedIds));
    }),
});
