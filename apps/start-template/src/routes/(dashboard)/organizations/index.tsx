"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { Spinner } from "@/components/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationInvitationsTable } from "@/features/organizations/organizations.invitations-table";
import { OrganizationsListTable } from "@/features/organizations/organizations.list-table";
import { OrganizationMembersTable } from "@/features/organizations/organizations.members-table";
import { useOrganizationPermissions } from "@/features/organizations/use-organization-permissions";
import { authClient } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/(dashboard)/organizations/")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
  }),
});

function RouteComponent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("organizations");

  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();

  const permissions = useOrganizationPermissions(activeOrganization?.id);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl tracking-tight">
            {t("SIDEBAR_ORGANIZATION")}
          </h2>
          <p className="text-muted-foreground">{t("ORG_PAGE_DESCRIPTION")}</p>
        </div>
      </div>

      {permissions.isOrganizationMember ? (
        <Tabs
          className="space-y-4"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="organizations">
              {t("ORG_MY_ORGANIZATIONS")}
            </TabsTrigger>
            <TabsTrigger value="members">{t("MEMBERS")}</TabsTrigger>
            <PermissionGuard permission="canManageInvitations">
              <TabsTrigger value="invitations">{t("INVITES")}</TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <TabsContent className="space-y-4" value="organizations">
            <OrganizationsListTable />
          </TabsContent>

          <TabsContent className="space-y-4" value="members">
            <OrganizationMembersTable />
          </TabsContent>

          <PermissionGuard permission="canManageInvitations">
            <TabsContent className="space-y-4" value="invitations">
              <OrganizationInvitationsTable
                organizationId={activeOrganization?.id ?? ""}
              />
            </TabsContent>
          </PermissionGuard>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <p>{t("ORG_NO_MEMBERSHIP")}</p>
        </div>
      )}
    </div>
  );
}
