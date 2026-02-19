"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ClockIcon,
  CopyIcon,
  MailIcon,
  MoreVerticalIcon,
  TrashIcon,
  UserCheckIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGridEnhanced } from "@/components/ui/data-grid-enhanced";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cancelInvitationOptions,
  resendInvitationOptions,
} from "@/features/organizations/organizations.factory.mutations";
import { organizationInvitationsOptions } from "@/features/organizations/organizations.factory.queries";
import { useOrganizationPermissions } from "@/features/organizations/use-organization-permissions";
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog";
import { formatDate } from "@/lib/date-utils";

import type { OrganizationInvitation } from "./organizations.types";

import { getInvitationStatusBadgeVariant } from "./organizations.utils";

function InvitationActionsDropdown({
  invitation,
  onResend,
  onCopyLink,
  onCancel,
  isExpired,
  isPending,
  permissions,
}: {
  invitation: OrganizationInvitation;
  onResend: (invitation: OrganizationInvitation) => void;
  onCopyLink: (invitation: OrganizationInvitation) => void;
  onCancel: (invitation: OrganizationInvitation) => void;
  isExpired: boolean;
  isPending: boolean;
  permissions: ReturnType<typeof useOrganizationPermissions>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger>
        <Button
          className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
          disabled={isExpired}
          size="icon"
          variant="ghost"
        >
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => {
            onResend(invitation);
            setOpen(false);
          }}
        >
          <MailIcon className="mr-2 h-4 w-4" />
          {t("ORG_RESEND")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onCopyLink(invitation);
            setOpen(false);
          }}
        >
          <CopyIcon className="mr-2 h-4 w-4" />
          {t("ORG_COPY_LINK")}
        </DropdownMenuItem>
        {isPending && permissions.canDeleteInvitations && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                onCancel(invitation);
                setOpen(false);
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {t("CANCEL")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrganizationInvitationsTable({
  organizationId,
}: {
  organizationId: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Get permissions once at the parent level
  const permissions = useOrganizationPermissions(organizationId);

  // Cancel invitation confirmation dialog
  const cancelDialog = useConfirmationDialog<OrganizationInvitation>({
    onConfirm: (invitation) => {
      cancelInvitationMutation.mutate(invitation.id);
    },
  });

  // Fetch organization invitations
  const { data: invitations = [], isLoading } = useQuery({
    ...organizationInvitationsOptions(organizationId),
    enabled: Boolean(organizationId),
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    ...cancelInvitationOptions(),
    onSuccess: () => {
      // Invalidate invitations for this org
      queryClient.invalidateQueries({
        queryKey: organizationInvitationsOptions(organizationId).queryKey,
      });
      toast.success(t("ORG_INVITATION_CANCELLED"));
      cancelDialog.close();
    },
    onError: (_error: Error) => {
      toast.error(t("ORG_INVITATION_CANCEL_FAILED"));
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    ...resendInvitationOptions(),
    onSuccess: () => {
      // Invalidate invitations for this org
      queryClient.invalidateQueries({
        queryKey: organizationInvitationsOptions(organizationId).queryKey,
      });
      toast.success(t("ORG_INVITATION_RESENT"));
    },
    onError: (_error: Error) => {
      toast.error(t("ORG_INVITATION_RESEND_FAILED"));
    },
  });

  const handleResendInvitation = (invitation: OrganizationInvitation) => {
    resendInvitationMutation.mutate(invitation);
  };

  const handleCopyInviteLink = async (invitation: OrganizationInvitation) => {
    try {
      const inviteLink = `${window.location.origin}/accept-invitation/${invitation.id}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success(t("ORG_INVITATION_LINK_COPIED"));
    } catch {
      toast.error(t("ORG_INVITATION_LINK_COPY_FAILED"));
    }
  };

  const columns = [
    {
      accessorFn: (row) => row.email,
      header: t("EMAIL"),
      accessorKey: "email",
      cell: ({ row }: { row: { original: OrganizationInvitation } }) => (
        <div className="flex items-center gap-3">
          <MailIcon className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.role,
      header: t("ROLE"),
      cell: ({ row }: { row: { original: OrganizationInvitation } }) => (
        <div className="flex items-center gap-2">
          <UserCheckIcon className="h-4 w-4" />
          <span className="capitalize">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.status,
      header: t("ORG_STATUS"),
      cell: ({ row }: { row: { original: OrganizationInvitation } }) => (
        <Badge variant={getInvitationStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.expiresAt,
      header: t("ORG_EXPIRES"),
      cell: ({ row }: { row: { original: OrganizationInvitation } }) => {
        const expiresAt = new Date(row.original.expiresAt);
        const isExpired = expiresAt < new Date();
        return (
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className={isExpired ? "text-destructive" : ""}>
              {formatDate(expiresAt)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: OrganizationInvitation } }) => {
        const invitation = row.original;
        const isExpired = new Date(invitation.expiresAt) < new Date();
        const isPending = invitation.status.toLowerCase() === "pending";

        return (
          <InvitationActionsDropdown
            invitation={invitation}
            isExpired={isExpired}
            isPending={isPending}
            onCancel={cancelDialog.open}
            onCopyLink={handleCopyInviteLink}
            onResend={handleResendInvitation}
            permissions={permissions}
          />
        );
      },
    },
  ] satisfies ColumnDef<OrganizationInvitation>[];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-lg">
            {t("ORG_INVITATIONS_TITLE")}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("ORG_INVITATIONS_DESC")}
          </p>
        </CardHeader>
        <CardContent>
          <DataGridEnhanced
            columns={columns}
            data={invitations}
            enableRowSelection={false}
            getRowId={(row) => row.id}
            initialPageSize={10}
            isLoading={isLoading}
          >
            <DataGridEnhanced.Toolbar
              searchable={true}
              searchColumn="email"
              searchPlaceholder={t("ORG_FILTER_INVITATIONS")}
              showColumnVisibility={true}
            />
            <DataGridEnhanced.Content emptyMessage="No invitations found." />
            <DataGridEnhanced.Pagination showRowsPerPage={true} />
          </DataGridEnhanced>
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={cancelDialog.setIsOpen}
        open={cancelDialog.isOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("ORG_CANCEL_INVITATION_TITLE")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("ORG_CANCEL_INVITATION_CONFIRM")}{" "}
              <strong>{cancelDialog.item?.email}</strong>?{" "}
              {t("ORG_ACTION_CANNOT_UNDO")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("ORG_KEEP_INVITATION")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={cancelDialog.confirm}
            >
              {t("ORG_CANCEL_INVITATION_BUTTON")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
