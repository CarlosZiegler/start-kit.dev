"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { InvitationStatus } from "better-auth/plugins";
import { ClockIcon, CopyIcon, UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGridEnhanced } from "@/components/ui/data-grid-enhanced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  acceptInvitationOptions,
  rejectInvitationOptions,
} from "@/features/organizations/organizations.factory.mutations";
import { userInvitationsOptions } from "@/features/organizations/organizations.factory.queries";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";

export const Route = createFileRoute("/(dashboard)/organizations/invitations/")(
  {
    component: RouteComponent,
    validateSearch: z.object({
      query: z.string().optional(),
    }),
  }
);

type UserInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "owner" | "member";
  status: InvitationStatus | string;
  expiresAt: Date | string;
  teamId?: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    createdAt: Date;
  };
};

function RouteComponent() {
  const { t } = useTranslation();
  const { bind } = useDebouncedSearchParam(Route, "query");
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: invitationsData, isLoading } = useQuery({
    ...userInvitationsOptions(),
    placeholderData: keepPreviousData,
  });

  const invitations = (invitationsData || []) as UserInvitation[];
  const totalCount = invitations.length; // TODO: Backend should return total count

  const acceptInvitationMutation = useMutation({
    ...acceptInvitationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userInvitationsOptions().queryKey,
      });
      toast.success(t("INVITATION_ACCEPT_SUCCESS"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("INVITATION_ACCEPT_FAILED"));
    },
  });

  const rejectInvitationMutation = useMutation({
    ...rejectInvitationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userInvitationsOptions().queryKey,
      });
      toast.success(t("INVITATION_REJECT_SUCCESS"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("INVITATION_REJECT_FAILED"));
    },
  });

  const pendingInvitations = useMemo(
    () =>
      invitations.filter(
        (inv) => String(inv.status).toLowerCase() === "pending"
      ),
    [invitations]
  );

  const acceptedInvitations = useMemo(
    () =>
      invitations.filter(
        (inv) => String(inv.status).toLowerCase() === "accepted"
      ),
    [invitations]
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary" as const;
      case "accepted":
        return "default" as const;
      case "rejected":
        return "destructive" as const;
      case "expired":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const baseColumns: ColumnDef<UserInvitation>[] = [
    {
      accessorKey: "organization.name",
      header: t("SIDEBAR_ORGANIZATION"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.organization?.name}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: t("ROLE"),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("ORG_STATUS"),
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(String(row.original.status))}>
          {String(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: t("ORG_EXPIRES"),
      cell: ({ row }) => {
        const expiresAt = new Date(row.original.expiresAt);
        const isExpired = expiresAt < new Date();
        return (
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className={isExpired ? "text-destructive" : ""}>
              {expiresAt.toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
  ];

  const pendingColumns: ColumnDef<UserInvitation>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: t("ACTIONS"),
      cell: ({ row }) => {
        const invitation = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              disabled={
                acceptInvitationMutation.isPending ||
                rejectInvitationMutation.isPending
              }
              onClick={() => rejectInvitationMutation.mutate(invitation.id)}
              type="button"
              variant="outline"
            >
              {t("DECLINE")}
            </Button>
            <Button
              disabled={
                acceptInvitationMutation.isPending ||
                rejectInvitationMutation.isPending
              }
              onClick={() => acceptInvitationMutation.mutate(invitation.id)}
              type="button"
            >
              {t("ORGANIZATION_JOIN")}
            </Button>
          </div>
        );
      },
    },
  ];

  const acceptedColumns: ColumnDef<UserInvitation>[] = [
    ...baseColumns,
    {
      id: "copy",
      header: t("ORG_COPY_LINK"),
      cell: ({ row }) => (
        <Button
          onClick={async () => {
            try {
              const inviteLink = `${window.location.origin}/accept-invitation/${row.original.id}`;
              await navigator.clipboard.writeText(inviteLink);
              toast.success(t("ORG_INVITATION_LINK_COPIED"));
            } catch {
              toast.error(t("ORG_INVITATION_LINK_COPY_FAILED"));
            }
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          <CopyIcon className="mr-2 h-4 w-4" /> {t("COPY")}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl tracking-tight">
            {t("INVITES")}
          </h2>
          <p className="text-muted-foreground">{t("ORG_INVITATIONS_DESC")}</p>
        </div>
      </div>

      <Tabs className="space-y-4" defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t("PENDING")}</TabsTrigger>
          <TabsTrigger value="accepted">{t("ACCEPTED")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" /> {t("PENDING")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataGridEnhanced
                columns={pendingColumns}
                data={pendingInvitations}
                enableRowSelection={false}
                getRowId={(row) => row.id}
                initialPageSize={10}
                isLoading={isLoading}
                manualPagination={true}
                onPaginationChange={setPagination}
                pageCount={Math.ceil(totalCount / pagination.pageSize)}
                pagination={pagination}
              >
                <DataGridEnhanced.Toolbar
                  searchable={true}
                  searchBind={bind}
                  searchPlaceholder={t("ORG_FILTER_INVITATIONS")}
                  showColumnVisibility={true}
                />
                <DataGridEnhanced.Content emptyMessage="No pending invitations." />
                <DataGridEnhanced.Pagination showRowsPerPage={true} />
              </DataGridEnhanced>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accepted">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" /> {t("ACCEPTED")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataGridEnhanced
                columns={acceptedColumns}
                data={acceptedInvitations}
                enableRowSelection={false}
                getRowId={(row) => row.id}
                initialPageSize={10}
                isLoading={isLoading}
                manualPagination={true}
                onPaginationChange={setPagination}
                pageCount={Math.ceil(totalCount / pagination.pageSize)}
                pagination={pagination}
              >
                <DataGridEnhanced.Toolbar
                  searchable={true}
                  searchBind={bind}
                  searchPlaceholder={t("ORG_FILTER_INVITATIONS")}
                  showColumnVisibility={true}
                />
                <DataGridEnhanced.Content emptyMessage="No accepted invitations." />
                <DataGridEnhanced.Pagination showRowsPerPage={true} />
              </DataGridEnhanced>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
