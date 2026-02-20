"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  CalendarIcon,
  CheckCircleIcon,
  Plus,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { TableActionsDropdown } from "@/components/table-actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGridEnhanced } from "@/components/ui/data-grid-enhanced";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";
import { formatDate } from "@/lib/date-utils";
import { OrganizationCreateDialog } from "./organizations.create-dialog";
import type { Organization } from "./organizations.types";

export function OrganizationsListTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const {
    data: organizations,
    refetch,
    isPending,
  } = authClient.useListOrganizations();

  const handleSetActiveOrganization = async (organizationId: string) => {
    if (organizationId === activeOrganization?.id) {
      toast.info(t("ORG_ALREADY_ACTIVE"));
      return;
    }
    const { data, error } = await authClient.organization.setActive({
      organizationId,
    });

    if (error) {
      toast.error(error.message ?? t("ORG_UNSET_FAILED"));
      return;
    }

    refetch();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["organization"] }),
      queryClient.invalidateQueries({ queryKey: ["session"] }),
    ]);
    toast.success(t("ORG_ACTIVE_ACTION", { OrganizationName: data?.name }));
  };

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "name",
      header: t("NAME"),
      cell: ({ row }) => {
        const org = row.original;
        const isActive = activeOrganization?.id === org.id;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
              {org.logo ? (
                <img
                  alt={org.name}
                  className="size-full rounded-lg object-cover"
                  height={40}
                  src={org.logo}
                  width={40}
                />
              ) : (
                <Building2 className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium">
                {org.name}
                {isActive ? (
                  <Badge className="gap-1" variant="default">
                    <CheckCircleIcon className="size-3" />
                    {t("ORG_ACTIVE")}
                  </Badge>
                ) : null}
              </div>
              <div className="text-muted-foreground text-sm">{org.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: t("ORGANIZATION_SLUG"),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("ORG_CREATED"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="size-4" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const org = row.original;
        const isActive = activeOrganization?.id === org.id;

        return (
          <TableActionsDropdown ariaLabel={t("ACTIONS")}>
            <DropdownMenuItem
              disabled={isActive}
              onClick={() => handleSetActiveOrganization(org.id)}
            >
              <CheckCircleIcon className="mr-2 size-4" />
              {isActive ? t("ORG_ALREADY_ACTIVE") : t("ORG_SET_ACTIVE")}
            </DropdownMenuItem>
          </TableActionsDropdown>
        );
      },
    },
  ];

  const orgList = (organizations ?? []) as Organization[];
  const totalCount = orgList.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
              <UsersIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="font-medium text-lg">
                {t("ORG_MY_ORGANIZATIONS")}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {t("ORG_MY_ORGANIZATIONS_DESC")}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t("ORG_CREATE_NEW")}
          </Button>
        </div>
      </CardHeader>
      <OrganizationCreateDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />
      <CardContent>
        <DataGridEnhanced
          columns={columns}
          data={orgList}
          enableRowSelection={false}
          getRowId={(row) => row.id}
          initialPageSize={10}
          isLoading={isPending}
          manualPagination={false}
          onPaginationChange={setPagination}
          pageCount={Math.ceil(totalCount / pagination.pageSize)}
          pagination={pagination}
        >
          <DataGridEnhanced.Toolbar
            searchable={true}
            searchColumn="name"
            searchPlaceholder={t("ORG_SEARCH_ORGANIZATIONS")}
            showColumnVisibility={true}
          />
          <DataGridEnhanced.Content emptyMessage={t("ORG_NO_ORGANIZATIONS")} />
          <DataGridEnhanced.Pagination showRowsPerPage={true} />
        </DataGridEnhanced>
      </CardContent>
    </Card>
  );
}
