"use client";

import { type ComponentType, Suspense, lazy } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

/**
 * Registry of lazily-loaded settings section components.
 * Each section is code-split and only loaded when selected.
 */
const SECTION_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<ComponentType>
> = {
  profile: lazy(() =>
    import("./settings.page.section.profile").then((m) => ({
      default: m.ProfileSection,
    }))
  ),
  security: lazy(() =>
    import("./settings.page.section.security").then((m) => ({
      default: m.SecuritySection,
    }))
  ),
  appearance: lazy(() =>
    import("./settings.page.section.appearance").then((m) => ({
      default: m.AppearanceSection,
    }))
  ),
  billing: lazy(() =>
    import("@/features/subscription/subscription.section").then((m) => ({
      default: m.SubscriptionSection,
    }))
  ),
};

const DEFAULT_SECTION = "profile";

export function SettingsContent({ id }: { id: string }) {
  const SectionComponent =
    SECTION_COMPONENTS[id] ?? SECTION_COMPONENTS[DEFAULT_SECTION];

  return (
    <ScrollArea className="flex h-[calc(100vh-135px)] w-full max-w-8xl">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        }
      >
        <SectionComponent />
      </Suspense>
    </ScrollArea>
  );
}
