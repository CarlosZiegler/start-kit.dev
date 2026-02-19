"use client";

import type { ComponentType } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SubscriptionSection } from "@/features/subscription/subscription.section";

import { AppearanceSection } from "./settings.page.section.apearence";
import { ProfileSection } from "./settings.page.section.profile";
import { SecuritySection } from "./settings.page.section.security";

/**
 * Registry of settings section components
 * Add new sections here to make them available
 */
const SECTION_COMPONENTS: Record<string, ComponentType> = {
  profile: ProfileSection,
  security: SecuritySection,
  appearance: AppearanceSection,
  billing: SubscriptionSection,
};

const DEFAULT_SECTION = "profile";

export function SettingsContent({ id }: { id: string }) {
  const SectionComponent =
    SECTION_COMPONENTS[id] ?? SECTION_COMPONENTS[DEFAULT_SECTION];

  return (
    <ScrollArea className="flex h-[calc(100vh-135px)] w-full max-w-8xl">
      <SectionComponent />
    </ScrollArea>
  );
}
