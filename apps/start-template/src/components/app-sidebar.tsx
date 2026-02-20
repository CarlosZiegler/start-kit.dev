"use client";

import { ClientOnly } from "@tanstack/react-router";
import { Building2, Home, MessageSquare, Settings, Shield } from "lucide-react";
import type * as React from "react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

import { NavItems } from "@/components/nav-items";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { CommandMenu } from "@/features/command-search/command-menu";
import {
	OrganizationSelect,
	OrganizationSelectSkeleton,
} from "@/features/organizations/organizations.select";

import { isOrganizationsEnabled } from "@/lib/flags";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation();

	const navItems = [
		{
			title: t("SIDEBAR_OVERVIEW"),
			url: "/overview",
			icon: Home,
		},
		{
			title: t("SIDEBAR_ORGANIZATION"),
			icon: Building2,
			children: [
				{
					title: t("ORG_OVERVIEW"),
					url: "/organizations/",
				},
				{
					title: t("MY_INVITES"),
					url: "/organizations/invitations/",
				},
			],
		},
		{
			title: "AI Chat",
			url: "/chat",
			icon: MessageSquare,
		},
		{
			title: t("SETTINGS"),
			icon: Settings,
			children: [
				{
					title: t("SETTINGS_PROFILE_TITLE"),
					url: "/settings",
				},
				{
					title: t("SETTINGS_SECURITY_TITLE"),
					url: "/settings/security",
				},
				{
					title: t("SETTINGS_APPEARANCE_TITLE"),
					url: "/settings/appearance",
				},
				// Billing menu item - only shown when Stripe is enabled
				{
					title: t("SETTINGS_BILLING_TITLE"),
					url: "/settings/billing",
				},
			],
		},
	].filter((item) => {
		if (!isOrganizationsEnabled) {
			return item.url !== "/organizations";
		}
		return true;
	});

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<ClientOnly fallback={<OrganizationSelectSkeleton />}>
					<OrganizationSelect />
				</ClientOnly>
				<CommandMenu />
			</SidebarHeader>
			<SidebarContent>
				<NavItems items={navItems?.filter(Boolean)} />
			</SidebarContent>
			<SidebarFooter>
				<Suspense fallback={<Skeleton className="h-10 w-full" />}>
					<NavUser />
				</Suspense>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
