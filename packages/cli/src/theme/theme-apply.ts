import { writeFileSync } from "node:fs";
import { log, spinner } from "@clack/prompts";
import type {
  BaseColorName,
  FontOption,
  RadiusPreset,
  ThemeConfig,
  ThemeName,
} from "./theme-types";
import { DEFAULT_CONFIG, FONT_OPTIONS, RADIUS_VALUES, THEMES } from "./theme-registry";
import { generateFullAppCss } from "./theme-utils";

const THEME_NAMES = THEMES.map((t) => t.name);
const RADIUS_KEYS = Object.keys(RADIUS_VALUES) as RadiusPreset[];
const FONT_VALUES = FONT_OPTIONS.map((f) => f.value);

function extractFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx < 0 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

export function parseThemeArgs(args: string[]): ThemeConfig | null {
  const rawTheme = extractFlag(args, "--theme");
  const rawBase = extractFlag(args, "--base-color");
  const rawRadius = extractFlag(args, "--radius");
  const rawFont = extractFlag(args, "--font");

  if (!rawTheme && !rawBase && !rawRadius && !rawFont) {
    return null;
  }

  let theme: ThemeName = DEFAULT_CONFIG.theme;
  if (rawTheme) {
    if (THEME_NAMES.includes(rawTheme)) {
      theme = rawTheme as ThemeName;
    } else {
      log.warn(
        `Unknown theme "${rawTheme}". Available: ${THEME_NAMES.join(", ")}. Using default "${DEFAULT_CONFIG.theme}".`
      );
    }
  }

  let baseColor: BaseColorName = DEFAULT_CONFIG.baseColor;
  if (rawBase) {
    if (["neutral", "stone", "zinc", "gray"].includes(rawBase)) {
      baseColor = rawBase as BaseColorName;
    } else {
      log.warn(
        `Unknown base color "${rawBase}". Available: neutral, stone, zinc, gray. Using default "${DEFAULT_CONFIG.baseColor}".`
      );
    }
  }

  let radius: RadiusPreset = DEFAULT_CONFIG.radius;
  if (rawRadius) {
    if (RADIUS_KEYS.includes(rawRadius as RadiusPreset)) {
      radius = rawRadius as RadiusPreset;
    } else {
      log.warn(
        `Unknown radius "${rawRadius}". Available: ${RADIUS_KEYS.join(", ")}. Using default "${DEFAULT_CONFIG.radius}".`
      );
    }
  }

  let font: FontOption = DEFAULT_CONFIG.font;
  if (rawFont) {
    if (FONT_VALUES.includes(rawFont as FontOption)) {
      font = rawFont as FontOption;
    } else {
      log.warn(
        `Unknown font "${rawFont}". Available: ${FONT_VALUES.join(", ")}. Using default "${DEFAULT_CONFIG.font}".`
      );
    }
  }

  return { theme, baseColor, radius, font };
}

export function applyTheme(targetDir: string, config: ThemeConfig): void {
  const s = spinner();
  s.start("Applying theme...");

  const css = generateFullAppCss(config);
  writeFileSync(`${targetDir}/src/app.css`, css, "utf-8");

  s.stop(
    `Theme applied: ${config.theme} (base: ${config.baseColor}, radius: ${config.radius}, font: ${config.font})`
  );
}
