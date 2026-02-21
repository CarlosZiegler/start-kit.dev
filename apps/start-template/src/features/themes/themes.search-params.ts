import { z } from "zod";
import type { ThemeConfig } from "./themes.types";
import { DEFAULT_CONFIG } from "./themes.registry";

export const themeSearchParamsSchema = z.object({
  baseColor: z
    .enum(["neutral", "stone", "zinc", "gray"])
    .optional()
    .default("neutral"),
  theme: z
    .enum([
      "neutral",
      "stone",
      "zinc",
      "gray",
      "amber",
      "blue",
      "cyan",
      "emerald",
      "fuchsia",
      "green",
      "indigo",
      "lime",
      "orange",
      "pink",
      "purple",
      "red",
      "rose",
      "sky",
      "teal",
      "violet",
      "yellow",
    ])
    .optional()
    .default("neutral"),
  radius: z
    .enum(["none", "sm", "md", "lg", "xl"])
    .optional()
    .default("lg"),
  font: z
    .enum(["inter", "geist", "system"])
    .optional()
    .default("inter"),
  customColor: z.string().optional(),
});

export type ThemeSearchParams = z.infer<typeof themeSearchParamsSchema>;

export function serializeThemeConfig(config: ThemeConfig): Record<string, string> {
  const params: Record<string, string> = {};

  if (config.baseColor !== DEFAULT_CONFIG.baseColor) {
    params.baseColor = config.baseColor;
  }
  if (config.theme !== DEFAULT_CONFIG.theme) {
    params.theme = config.theme;
  }
  if (config.radius !== DEFAULT_CONFIG.radius) {
    params.radius = config.radius;
  }
  if (config.font !== DEFAULT_CONFIG.font) {
    params.font = config.font;
  }
  if (config.customColor) {
    params.customColor = config.customColor;
  }

  return params;
}

export function buildShareUrl(config: ThemeConfig): string {
  const params = serializeThemeConfig(config);
  const searchString = new URLSearchParams(params).toString();
  const base = `${typeof window !== "undefined" ? window.location.origin : ""}/themes`;
  return searchString ? `${base}?${searchString}` : base;
}

export function buildCliCommand(config: ThemeConfig): string {
  const parts = ["bunx create-start-kit-dev create my-app"];

  if (config.theme !== DEFAULT_CONFIG.theme) {
    parts.push(`--theme ${config.theme}`);
  }
  if (config.baseColor !== DEFAULT_CONFIG.baseColor) {
    parts.push(`--base-color ${config.baseColor}`);
  }
  if (config.radius !== DEFAULT_CONFIG.radius) {
    parts.push(`--radius ${config.radius}`);
  }
  if (config.font !== DEFAULT_CONFIG.font) {
    parts.push(`--font ${config.font}`);
  }

  return parts.join(" ");
}
