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
import {
  ClockIcon,
  MailIcon,
  MoreVerticalIcon,
  ShieldIcon,
  TrashIcon,
  UserCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { PermissionGuard } from "@/components/guards/permission-guard";
import { Spinner } from "@/components/spinner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSelectColumn,
  DataGridEnhanced,
} from "@/components/ui/data-grid-enhanced";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cancelInvitationOptions,
  removeMemberOptions,
  resendInvitationOptions,
  updateMemberRoleOptions,
} from "@/features/organizations/organizations.factory.mutations";
import {
  organizationInvitationsOptions,
  organizationMembersOptions,
} from "@/features/organizations/organizations.factory.queries";
import { InviteMemberDialog } from "@/features/organizations/organizations.invite-member-dialog";
import { OrganizationsListTable } from "@/features/organizations/organizations.list-table";
import { UpdateMemberRoleDialog } from "@/features/organizations/organizations.update-member-role-dialog";
import { useOrganizationPermissions } from "@/features/organizations/use-organization-permissions";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";
import { authClient } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/(dashboard)/organizations/")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
  }),
});

type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type RawMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
  };
};

type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "owner" | "member";
  status: InvitationStatus;
  inviterId: string;
  expiresAt: Date;
};

function MemberActionsDropdown({
  member,
  onUpdateRole,
  onRemoveMember,
  permissions,
}: {
  member: Member;
  onUpdateRole: (member: Member) => void;
  onRemoveMember: (member: Member) => void;
  permissions: ReturnType<typeof useOrganizationPermissions>;
}) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
          variant="ghost"
        >
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">{t("ORG_MEMBERS_OPEN_MENU")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {permissions.canUpdateRoles && (
          <DropdownMenuItem
            onClick={() => {
              onUpdateRole(member);
            }}
          >
            {t("ORG_MEMBERS_UPDATE_ROLE")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {permissions.canRemove && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              onRemoveMember(member);
            }}
          >
            {t("ORG_MEMBERS_REMOVE")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InvitationActionsDropdown({
  invitation,
  isPending,
  isExpired,
  onResend,
  onCopyLink,
  onCancel,
  permissions,
}: {
  invitation: Invitation;
  isPending: boolean;
  isExpired: boolean;
  onResend: (invitation: Invitation) => void;
  onCopyLink: (invitation: Invitation) => void;
  onCancel: (invitation: Invitation) => void;
  permissions: ReturnType<typeof useOrganizationPermissions>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger>
        <Button
          className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
          variant="ghost"
        >
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">{t("ORG_OPEN_MENU")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            onCopyLink(invitation);
            setOpen(false);
          }}
        >
          <MailIcon className="mr-2 h-4 w-4" />
          {t("ORG_COPY_LINK")}
        </DropdownMenuItem>

        {permissions.canManageInvitations && isPending && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isExpired}
              onClick={() => {
                onResend(invitation);
                setOpen(false);
              }}
            >
              <UserCheckIcon className="mr-2 h-4 w-4" />
              {t("ORG_RESEND")}
            </DropdownMenuItem>
          </>
        )}

        {permissions.canManageInvitations && (
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

function RouteComponent() {
  const { t } = useTranslation();
  const { bind, searchValue } = useDebouncedSearchParam(Route, "query");
  const [activeTab, setActiveTab] = useState("organizations");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUpdateRoleDialogOpen, setIsUpdateRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [invitationsPagination, setInvitationsPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [invitationToCancel, setInvitationToCancel] =
    useState<Invitation | null>(null);
  const [isCancelInvitationDialogOpen, setIsCancelInvitationDialogOpen] =
    useState(false);

  const queryClient = useQueryClient();

  // Get active organization
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();

  // Get permissions
  const permissions = useOrganizationPermissions(activeOrganization?.id);
  const { isOrganizationMember } = useOrganizationPermissions();

  // Fetch organization members with pagination and search
  const orgId = activeOrganization?.id ?? "";
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    ...organizationMembersOptions(orgId, {
      page: pagination.pageIndex + 1, // Backend uses 1-indexed pages
      pageSize: pagination.pageSize,
      search: searchValue || undefined,
    }),
    enabled: Boolean(activeOrganization?.id),
    placeholderData: keepPreviousData,
  });

  const members: Member[] = (membersData?.members || []).map(
    (member: RawMember): Member => ({
      ...member,
      user: {
        ...member.user,
        image: member.user.image ?? null,
      },
    })
  );
  const totalCount = membersData?.total ?? 0;

  // Fetch organization invitations with pagination and search
  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    ...organizationInvitationsOptions(orgId),
    enabled: Boolean(activeOrganization?.id),
    placeholderData: keepPreviousData,
  });

  const invitations = (invitationsData || []) as Invitation[];
  const invitationsTotalCount = invitations.length; // TODO: Backend should return total

  // Remove member mutation
  const removeMemberMutation = useMutation({
    ...removeMemberOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationMembersOptions(
          memberToRemove?.organizationId ?? ""
        ).queryKey,
      });
      toast.success(t("ORG_MEMBER_REMOVED_SUCCESS"));
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    },
    onError: (error) => {
      toast.error(`${t("ORG_MEMBER_REMOVE_FAILED")}${error.message}`);
    },
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    ...updateMemberRoleOptions(),
    onSuccess: () => {
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

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate({
        memberIdOrEmail: memberToRemove.id,
        organizationId: memberToRemove.organizationId,
      });
    }
  };

  const handleUpdateRole = (member: Member) => {
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

  const selectedMemberData = selectedMember
    ? {
        ...selectedMember,
        createdAt:
          selectedMember.createdAt instanceof Date
            ? selectedMember.createdAt.toISOString()
            : selectedMember.createdAt,
      }
    : null;

  // Invitation mutations
  const cancelInvitationMutation = useMutation({
    ...cancelInvitationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationInvitationsOptions(orgId).queryKey,
      });
      toast.success(t("ORG_INVITATION_CANCELLED"));
      setIsCancelInvitationDialogOpen(false);
      setInvitationToCancel(null);
    },
    onError: () => {
      toast.error(t("ORG_INVITATION_CANCEL_FAILED"));
    },
  });

  const resendInvitationMutation = useMutation({
    ...resendInvitationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationInvitationsOptions(orgId).queryKey,
      });
      toast.success(t("ORG_INVITATION_RESENT"));
    },
    onError: () => {
      toast.error(t("ORG_INVITATION_RESEND_FAILED"));
    },
  });

  // Invitation handlers
  const handleCancelInvitation = (invitation: Invitation) => {
    setInvitationToCancel(invitation);
    setIsCancelInvitationDialogOpen(true);
  };

  const confirmCancelInvitation = () => {
    if (invitationToCancel) {
      cancelInvitationMutation.mutate(invitationToCancel.id);
    }
  };

  const handleResendInvitation = (invitation: Invitation) => {
    resendInvitationMutation.mutate(invitation);
  };

  const handleCopyInviteLink = async (invitation: Invitation) => {
    try {
      const inviteLink = `${window.location.origin}/accept-invitation/${invitation.id}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success(t("ORG_INVITATION_LINK_COPIED"));
    } catch {
      toast.error(t("ORG_INVITATION_LINK_COPY_FAILED"));
    }
  };

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "member":
      case "owner":
        return <UserCheckIcon className="h-4 w-4" />;
      default:
        return <UserCheckIcon className="h-4 w-4" />;
    }
  };

  // Members table columns
  const membersColumns = [
    createSelectColumn(),
    {
      accessorFn: (row) => row.user.name,
      accessorKey: "name",
      header: t("NAME"),
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
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <MemberActionsDropdown
          member={row.original}
          onRemoveMember={handleRemoveMember}
          onUpdateRole={handleUpdateRole}
          permissions={permissions}
        />
      ),
    },
  ] satisfies ColumnDef<Member>[];

  // Invitations table columns
  const invitationsColumns = [
    {
      accessorFn: (row) => row.email,
      header: t("EMAIL"),
      accessorKey: "email",
      cell: ({ row }: { row: { original: Invitation } }) => (
        <div className="flex items-center gap-3">
          <MailIcon className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.role,
      header: t("ROLE"),
      cell: ({ row }: { row: { original: Invitation } }) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(row.original.role)}
          <span className="capitalize">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.status,
      header: t("ORG_STATUS"),
      cell: ({ row }: { row: { original: Invitation } }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.expiresAt,
      header: t("ORG_EXPIRES"),
      cell: ({ row }: { row: { original: Invitation } }) => {
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
    {
      id: "actions",
      cell: ({ row }: { row: { original: Invitation } }) => {
        const invitation = row.original;
        const isExpired = new Date(invitation.expiresAt) < new Date();
        const isPending = invitation.status.toLowerCase() === "pending";

        return (
          <InvitationActionsDropdown
            invitation={invitation}
            isExpired={isExpired}
            isPending={isPending}
            onCancel={handleCancelInvitation}
            onCopyLink={handleCopyInviteLink}
            onResend={handleResendInvitation}
            permissions={permissions}
          />
        );
      },
    },
  ] satisfies ColumnDef<Invitation>[];

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

      {isOrganizationMember ? (
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
                  columns={membersColumns}
                  data={members}
                  enableRowSelection={false}
                  getRowId={(row) => row.id}
                  initialPageSize={10}
                  isLoading={isLoadingMembers}
                  manualPagination={true}
                  onPaginationChange={setPagination}
                  pageCount={Math.ceil(totalCount / pagination.pageSize)}
                  pagination={pagination}
                >
                  <DataGridEnhanced.Toolbar
                    searchable={true}
                    searchBind={bind}
                    searchPlaceholder={t("ORG_MEMBERS_FILTER")}
                    showColumnVisibility={true}
                  />
                  <DataGridEnhanced.Content emptyMessage="No members found." />
                  <DataGridEnhanced.Pagination showRowsPerPage={true} />
                </DataGridEnhanced>
              </CardContent>
            </Card>
          </TabsContent>

          <PermissionGuard permission="canManageInvitations">
            <TabsContent className="space-y-4" value="invitations">
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
                    columns={invitationsColumns}
                    data={invitations}
                    enableRowSelection={false}
                    getRowId={(row) => row.id}
                    initialPageSize={10}
                    isLoading={isLoadingInvitations}
                    manualPagination={true}
                    onPaginationChange={setInvitationsPagination}
                    pageCount={Math.ceil(
                      invitationsTotalCount / invitationsPagination.pageSize
                    )}
                    pagination={invitationsPagination}
                  >
                    <DataGridEnhanced.Toolbar
                      searchable={true}
                      searchBind={bind}
                      searchPlaceholder={t("ORG_FILTER_INVITATIONS")}
                      showColumnVisibility={true}
                    />
                    <DataGridEnhanced.Content emptyMessage="No invitations found." />
                    <DataGridEnhanced.Pagination showRowsPerPage={true} />
                  </DataGridEnhanced>
                </CardContent>
              </Card>
            </TabsContent>
          </PermissionGuard>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <p>{t("ORG_NO_MEMBERSHIP")}</p>
        </div>
      )}

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
        onOpenChange={setIsRemoveDialogOpen}
        open={isRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ORG_MEMBERS_REMOVE")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ORG_MEMBERS_REMOVE_CONFIRM")}{" "}
              <strong>
                {memberToRemove?.user.name || memberToRemove?.user.email}
              </strong>{" "}
              {t("ORG_MEMBERS_REMOVE_CONFIRM_END")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("CANCEL")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoveMember}
            >
              {t("REMOVE")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={setIsCancelInvitationDialogOpen}
        open={isCancelInvitationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ORG_INVITATION_CANCEL")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("ORG_INVITATION_CANCEL_CONFIRM")}{" "}
              <strong>{invitationToCancel?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("CANCEL")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmCancelInvitation}
            >
              {t("ORG_INVITATION_CANCEL")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
