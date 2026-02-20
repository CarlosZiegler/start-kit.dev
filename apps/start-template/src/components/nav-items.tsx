/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <explanation> */
"use client";

import { Link, useMatchRoute } from "@tanstack/react-router";
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

const TRAILING_SLASH_REGEX = /\/+$/;

type MenuItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  children?: Array<{ title: string; url: string; icon?: LucideIcon }>;
};
const normalizePath = (path: string): string =>
  path.replace(TRAILING_SLASH_REGEX, "");

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

const NavItem = ({ item }: { item: MenuItem }) => {
  const matchRoute = useMatchRoute();
  const parentActive = item.url
    ? matchRoute({ to: normalizePath(item.url), fuzzy: false })
    : false;

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  if (hasChildren) {
    // If item has children, wrap in Collapsible
    return (
      <Collapsible
        className="group/collapsible"
        defaultOpen={true}
        key={item.title}
      >
        <SidebarMenuItem>
          <SidebarMenuButton isActive={!!parentActive} render={<CollapsibleTrigger />}>
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub>
              {(item.children ?? []).map((child) => {
                const childActive = matchRoute({
                  to: normalizePath(child.url),
                  fuzzy: false,
                });

                return (
                  <SidebarMenuSubItem key={child.title}>
                    <SidebarMenuSubButton
                      isActive={!!childActive}
                      render={<Link to={child.url} />}
                    >
                      {child.icon ? <child.icon /> : null}
                      <span>{child.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
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
          isActive={!!parentActive}
          render={<Link to={item.url} />}
          tooltip={item.title}
        >
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton isActive={!!parentActive} tooltip={item.title}>
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};
