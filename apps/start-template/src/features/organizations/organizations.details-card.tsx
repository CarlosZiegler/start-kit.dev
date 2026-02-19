"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2Icon,
  CalendarIcon,
  CrownIcon,
  EditIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  activeMemberOptions,
  organizationMembersOptions,
} from "@/features/organizations/organizations.factory.queries";
import {
  formatRole,
  getRoleBadgeVariant,
  getRoleIcon,
} from "@/features/organizations/organizations.utils";
import { authClient } from "@/lib/auth/auth-client";
import { formatDate } from "@/lib/date-utils";

import { OrganizationEditDialog } from "./organizations.edit-dialog";

export function OrganizationDetailsCard() {
  const { t } = useTranslation();
  // Get active organization
  const { data: activeOrganization, isPending: isLoading } =
    authClient.useActiveOrganization();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: membersData } = useQuery({
    ...organizationMembersOptions(activeOrganization?.id ?? ""),
    enabled: !!activeOrganization?.id,
  });

  // Get active member role
  const { data: activeMember } = useQuery({
    ...activeMemberOptions(activeOrganization?.id ?? ""),
    enabled: !!activeOrganization?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2Icon className="h-5 w-5" />
            {t("ORG_DETAILS_TITLE")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2Icon className="h-5 w-5" />
            {t("ORG_NO_ACTIVE")}
          </CardTitle>
          <CardDescription>{t("ORG_NO_ACTIVE_DESC")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const memberCount = membersData?.total;
  const roleBadgeVariant = getRoleBadgeVariant(activeMember?.role || "member");

  type MemberLike = {
    role: string;
    user?: { name?: string | null; email?: string };
  };
  const ownerMember = (membersData?.members as MemberLike[] | undefined)?.find(
    (m) => m.role === "owner"
  );
  const ownerDisplay =
    ownerMember?.user?.name || ownerMember?.user?.email || "—";

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarImage src={activeOrganization.logo || ""} />
              <AvatarFallback className="font-semibold text-lg">
                {activeOrganization.name.slice(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div>
                <CardTitle className="font-bold text-2xl">
                  {activeOrganization.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  @{activeOrganization.slug}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className="px-2 py-1 font-medium text-xs"
                  variant={roleBadgeVariant}
                >
                  <span className="mr-1">
                    {getRoleIcon(activeMember?.role || "member", "h-3 w-3")}
                  </span>
                  {activeMember?.role
                    ? formatRole(activeMember.role)
                    : "Member"}
                </Badge>
              </div>
            </div>
          </div>

          <PermissionGuard permission="canManageOrganization">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditOpen(true)}
                size="sm"
                variant="outline"
              >
                <EditIcon className="mr-2 h-4 w-4" />
                {t("EDIT")}
              </Button>
            </div>
          </PermissionGuard>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div>
          <h3 className="mb-3 font-semibold text-sm">
            {t("ORG_OVERVIEW_TITLE")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm">{t("ORG_TOTAL_MEMBERS")}</p>
                  <p className="font-bold text-xl">{memberCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm">{t("ORG_CREATED")}</p>
                  <p className="font-semibold text-lg">
                    {formatDate(activeOrganization.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2">
                  <CrownIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm">{t("OWNER")}</p>
                  <p className="truncate font-medium text-sm">{ownerDisplay}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <OrganizationEditDialog
        onOpenChange={setIsEditOpen}
        open={isEditOpen}
        organization={activeOrganization}
      />
    </Card>
  );
}
