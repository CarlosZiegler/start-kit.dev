/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <explanation> */
"use client";

import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type MenuItem = {
	title: string;
	url?: string;
	icon?: LucideIcon;
	children?: Array<{ title: string; url: string; icon?: LucideIcon }>;
};

export function NavItems({ items }: { items: MenuItem[] }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavItem item={item} key={item.title} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

const activeProps = { "data-active": "" } as const;
const activeOptions = { exact: true } as const;

const NavItem = ({ item }: { item: MenuItem }) => {
	const hasChildren = Array.isArray(item.children) && item.children.length > 0;

	if (hasChildren) {
		return (
			<Collapsible
				className="group/collapsible"
				defaultOpen={true}
				key={item.title}
			>
				<SidebarMenuItem>
					<SidebarMenuButton render={<CollapsibleTrigger />}>
						{item.icon ? <item.icon /> : null}
						<span>{item.title}</span>
						<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
					<CollapsibleContent>
						<SidebarMenuSub>
							{(item.children ?? []).map((child) => (
								<SidebarMenuSubItem key={child.title}>
									<SidebarMenuSubButton
										render={
											<Link
												to={child.url}
												activeProps={activeProps}
												activeOptions={activeOptions}
											/>
										}
									>
										{child.icon ? <child.icon /> : null}
										<span>{child.title}</span>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		);
	}

	return (
		<SidebarMenuItem key={item.title}>
			{item.url ? (
				<SidebarMenuButton
					render={
						<Link
							to={item.url}
							activeProps={activeProps}
							activeOptions={activeOptions}
						/>
					}
					tooltip={item.title}
				>
					{item.icon ? <item.icon /> : null}
					<span>{item.title}</span>
				</SidebarMenuButton>
			) : (
				<SidebarMenuButton tooltip={item.title}>
					{item.icon ? <item.icon /> : null}
					<span>{item.title}</span>
				</SidebarMenuButton>
			)}
		</SidebarMenuItem>
	);
};
