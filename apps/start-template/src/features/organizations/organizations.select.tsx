"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { isOrganizationsEnabled } from "@/lib/flags";

import { OrganizationCreateDialog } from "./organizations.create-dialog";

export function OrganizationSelect() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations, refetch } = authClient.useListOrganizations();

  const handleSetActiveOrganization = async (organizationId: string) => {
    if (organizationId === activeOrganization?.id) {
      toast.error(t("ORG_ALREADY_ACTIVE"));
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
    await queryClient.invalidateQueries({
      queryKey: ["organization"],
    });
    toast.success(t("ORG_ACTIVE_ACTION", { OrganizationName: data?.name }));
  };

  if (!isOrganizationsEnabled) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <SidebarMenuButton
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrganization?.name ?? t("SIDEBAR_ORGANIZATION")}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  {t("SIDEBAR_ORGANIZATION")}
                </DropdownMenuLabel>
                {organizations?.map((org, index) => (
                  <DropdownMenuItem
                    className="gap-2 p-2"
                    key={org.name}
                    onClick={() => handleSetActiveOrganization(org.id)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Building2 className="size-3.5 shrink-0" />
                    </div>
                    {org.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-3.5" />
                </div>
                {t("ORG_CREATE_NEW")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <OrganizationCreateDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />
    </>
  );
}

export const OrganizationSelectSkeleton = () => (
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        size="lg"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            <Skeleton className="pulse h-4 w-24" />
          </span>
          <span className="truncate text-xs">
            <Skeleton className="pulse h-3 w-16" />
          </span>
        </div>
        <ChevronsUpDown className="ml-auto" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
);
