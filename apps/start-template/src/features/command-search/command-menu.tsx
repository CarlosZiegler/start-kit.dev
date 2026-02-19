"use client";

import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Home,
  Mail,
  MessageCircle,
  Palette,
  Search,
  Shield,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/auth-client";

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
};

export function CommandMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();

  const navigationItems: NavigationItem[] = [
    {
      title: t("SIDEBAR_OVERVIEW"),
      url: "/overview",
      icon: Home,
      shortcut: "D",
    },
    {
      title: t("SIDEBAR_CHAT"),
      url: "/chat",
      icon: MessageCircle,
      shortcut: "C",
    },
  ];

  const organizationItems: NavigationItem[] = [
    {
      title: t("ORG_OVERVIEW"),
      url: "/organizations/",
      icon: Building2,
      shortcut: "O",
    },
    {
      title: t("MY_INVITES"),
      url: "/organizations/invitations/",
      icon: Mail,
    },
  ];

  const settingsItems: NavigationItem[] = [
    {
      title: t("SETTINGS_PROFILE_TITLE"),
      url: "/settings",
      icon: User,
      shortcut: "P",
    },
    {
      title: t("SETTINGS_SECURITY_TITLE"),
      url: "/settings/security",
      icon: Shield,
    },
    {
      title: t("SETTINGS_APPEARANCE_TITLE"),
      url: "/settings/appearance",
      icon: Palette,
    },
  ];

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false);
      navigate({ to: url });
    },
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-muted-foreground"
            onClick={() => setOpen(true)}
            size="sm"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">
              {t("COMMAND_PALETTE_SEARCH")}
            </span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <CommandDialog
        description={t("COMMAND_PALETTE_PLACEHOLDER")}
        onOpenChange={setOpen}
        open={open}
        showCloseButton={false}
        title={t("COMMAND_PALETTE_TITLE")}
      >
        <CommandInput placeholder={t("COMMAND_PALETTE_PLACEHOLDER")} />
        <CommandList>
          <CommandEmpty>{t("COMMAND_PALETTE_NO_RESULTS")}</CommandEmpty>

          <CommandGroup heading={t("COMMAND_PALETTE_GROUP_NAVIGATION")}>
            {navigationItems.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => handleSelect(item.url)}
              >
                <item.icon className="mr-2 size-4" />
                <span>{item.title}</span>
                {item.shortcut ? (
                  <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>

          {activeOrganization ? (
            <CommandGroup heading={t("SIDEBAR_ORGANIZATION")}>
              {organizationItems.map((item) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => handleSelect(item.url)}
                >
                  <item.icon className="mr-2 size-4" />
                  <span>{item.title}</span>
                  {item.shortcut ? (
                    <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          <CommandGroup heading={t("SETTINGS")}>
            {settingsItems.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => handleSelect(item.url)}
              >
                <item.icon className="mr-2 size-4" />
                <span>{item.title}</span>
                {item.shortcut ? (
                  <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
