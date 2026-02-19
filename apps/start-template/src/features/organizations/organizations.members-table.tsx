/** biome-ignore-all lint/complexity/noUselessTernary: checkbox state in table */
/** biome-ignore-all lint/style/noNestedTernary: checkbox state in table */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { TableActionsDropdown } from "@/components/table-actions-dropdown";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSelectColumn,
  DataGridEnhanced,
} from "@/components/ui/data-grid-enhanced";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  removeMemberOptions,
  updateMemberRoleOptions,
} from "@/features/organizations/organizations.factory.mutations";
import { organizationMembersOptions } from "@/features/organizations/organizations.factory.queries";
import { useOrganizationPermissions } from "@/features/organizations/use-organization-permissions";
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog";
import { authClient } from "@/lib/auth/auth-client";
import { formatDate } from "@/lib/date-utils";
import { InviteMemberDialog } from "./organizations.invite-member-dialog";
import type {
  OrganizationMember,
  RawOrganizationMember,
} from "./organizations.types";
import { UpdateMemberRoleDialog } from "./organizations.update-member-role-dialog";

function MemberActionsDropdown({
  member,
  onUpdateRole,
  onRemoveMember,
  permissions,
}: {
  member: OrganizationMember;
  onUpdateRole: (member: OrganizationMember) => void;
  onRemoveMember: (member: OrganizationMember) => void;
  permissions: ReturnType<typeof useOrganizationPermissions>;
}) {
  const { t } = useTranslation();

  return (
    <TableActionsDropdown ariaLabel={t("ORG_MEMBERS_OPEN_MENU")}>
      {permissions.canUpdateRoles && (
        <DropdownMenuItem onClick={() => onUpdateRole(member)}>
          {t("ORG_MEMBERS_UPDATE_ROLE")}
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      {permissions.canRemove && (
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onRemoveMember(member)}
        >
          {t("ORG_MEMBERS_REMOVE")}
        </DropdownMenuItem>
      )}
    </TableActionsDropdown>
  );
}

export function OrganizationMembersTable() {
  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Get active organization first
  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Get permissions once at the parent level
  const permissions = useOrganizationPermissions(activeOrganization?.id);

  // Fetch organization members via query options
  const orgId = activeOrganization?.id ?? "";
  const { data, isLoading } = useQuery({
    ...organizationMembersOptions(orgId),
    enabled: Boolean(activeOrganization?.id),
  });

  const members: OrganizationMember[] = (data?.members || []).map(
    (member: RawOrganizationMember): OrganizationMember => ({
      ...member,
      user: {
        ...member.user,
        image: member.user.image ?? null,
      },
    })
  );

  // Remove member confirmation dialog
  const removeDialog = useConfirmationDialog<OrganizationMember>({
    onConfirm: (member) => {
      removeMemberMutation.mutate({
        memberIdOrEmail: member.id,
        organizationId: member.organizationId,
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    ...removeMemberOptions(),
    onSuccess: () => {
      // Invalidate members for this org
      queryClient.invalidateQueries({
        queryKey: organizationMembersOptions(
          removeDialog.item?.organizationId ?? ""
        ).queryKey,
      });
      toast.success(t("ORG_MEMBER_REMOVED_SUCCESS"));
      removeDialog.close();
    },
    onError: (error) => {
      toast.error(`${t("ORG_MEMBER_REMOVE_FAILED")}${error.message}`);
    },
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    ...updateMemberRoleOptions(),
    onSuccess: () => {
      // Invalidate members for this org
      queryClient.invalidateQueries({
        queryKey: organizationMembersOptions(
          selectedMember?.organizationId ?? ""
        ).queryKey,
      });
      toast.success(t("ORG_MEMBER_ROLE_UPDATED"));
      setIsUpdateRoleDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      toast.error(`${t("ORG_MEMBER_ROLE_UPDATE_FAILED")}${error.message}`);
    },
  });

  const handleUpdateRole = (member: OrganizationMember) => {
    setSelectedMember(member);
    setIsUpdateRoleDialogOpen(true);
  };

  const confirmUpdateRole = (newRole: string) => {
    if (selectedMember) {
      updateMemberRoleMutation.mutate({
        memberId: selectedMember.id,
        role: newRole,
        organizationId: selectedMember.organizationId,
      });
    }
  };

  // Convert Member to MemberData for the dialog
  const selectedMemberData = selectedMember
    ? {
        ...selectedMember,
        createdAt:
          selectedMember.createdAt instanceof Date
            ? selectedMember.createdAt.toISOString()
            : selectedMember.createdAt,
      }
    : null;

  const columns = [
    createSelectColumn(),
    {
      accessorFn: (row) => row.user.name,
      accessorKey: "name",
      header: t("NAME"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={member.user.image || ""} />
              <AvatarFallback>
                {member.user.name?.charAt(0) || member.user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="font-medium">
                {member.user.name || t("ORG_MEMBERS_NO_NAME")}
              </div>
              <div className="text-muted-foreground text-sm">
                {member.user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.role,
      header: t("ROLE"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-4 w-4" />
          <span className="capitalize">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.createdAt,
      header: t("ORG_MEMBERS_JOINED"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }) => (
        <MemberActionsDropdown
          member={row.original}
          onRemoveMember={removeDialog.open}
          onUpdateRole={handleUpdateRole}
          permissions={permissions}
        />
      ),
    },
  ] satisfies ColumnDef<OrganizationMember>[];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-medium text-lg">
                {t("ORG_MEMBERS")}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {t("ORG_MEMBERS_DESC")}{" "}
                {activeOrganization?.name || "your organization"}.
              </p>
            </div>
            <PermissionGuard permission="canInvite">
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                {t("INVITE_MEMBER")}
              </Button>
            </PermissionGuard>
          </div>
        </CardHeader>
        <CardContent>
          <DataGridEnhanced
            columns={columns}
            data={members}
            enableRowSelection={false}
            getRowId={(row) => row.id}
            initialPageSize={10}
            isLoading={isLoading}
          >
            <DataGridEnhanced.Toolbar
              searchable={true}
              searchColumn="name"
              searchPlaceholder={t("ORG_MEMBERS_FILTER")}
              showColumnVisibility={true}
            />
            <DataGridEnhanced.Content emptyMessage="No members found." />
            <DataGridEnhanced.Pagination showRowsPerPage={true} />
          </DataGridEnhanced>
        </CardContent>
      </Card>

      <InviteMemberDialog
        onOpenChange={setIsInviteDialogOpen}
        open={isInviteDialogOpen}
        organizationId={activeOrganization?.id}
      />

      <UpdateMemberRoleDialog
        member={selectedMemberData}
        onOpenChange={setIsUpdateRoleDialogOpen}
        onUpdateRole={confirmUpdateRole}
        open={isUpdateRoleDialogOpen}
      />

      <AlertDialog
        onOpenChange={removeDialog.setIsOpen}
        open={removeDialog.isOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ORG_MEMBERS_REMOVE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ORG_MEMBERS_REMOVE_CONFIRM")}{" "}
              <strong>
                {removeDialog.item?.user.name || removeDialog.item?.user.email}
              </strong>{" "}
              {t("ORG_MEMBERS_REMOVE_CONFIRM_END")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("CANCEL")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={removeDialog.confirm}
            >
              {t("REMOVE")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
