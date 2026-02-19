"use client";

import type { UITree } from "@json-render/core";

import { JSONUIProvider, Renderer } from "@json-render/react";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";

import { blockRegistry } from "./block-generator.registry";

type BlockGeneratorPreviewProps = {
  tree: UITree | null;
  isLoading: boolean;
};

export function BlockGeneratorPreview({
  tree,
  isLoading,
}: BlockGeneratorPreviewProps) {
  if (isLoading) {
    return <PreviewSkeleton />;
  }

  if (!tree) {
    return <PreviewEmpty />;
  }

  return (
    <JSONUIProvider registry={blockRegistry}>
      <Renderer registry={blockRegistry} tree={tree} />
    </JSONUIProvider>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  );
}

function PreviewEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <Eye className="size-8 opacity-50" />
      <p className="text-sm">{t("LAB_PREVIEW_EMPTY_TITLE")}</p>
    </div>
  );
}
