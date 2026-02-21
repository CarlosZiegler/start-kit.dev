import type { ThemeConfig, ThemeCssVars } from "./themes.types";
import {
  BASE_COLOR_NAMES,
  FONT_OPTIONS,
  RADIUS_VALUES,
  THEMES,
} from "./themes.registry";

export function buildTheme(
  baseColor: string,
  themeName: string
): { light: ThemeCssVars; dark: ThemeCssVars } {
  const base = THEMES.find((t) => t.name === baseColor);
  const accent = THEMES.find((t) => t.name === themeName);

  if (!base) {
    const fallback = THEMES[0];
    return { light: { ...fallback.cssVars.light }, dark: { ...fallback.cssVars.dark } };
  }

  const isBaseColorTheme = BASE_COLOR_NAMES.includes(
    themeName as (typeof BASE_COLOR_NAMES)[number]
  );

  if (!accent || isBaseColorTheme) {
    return { light: { ...base.cssVars.light }, dark: { ...base.cssVars.dark } };
  }

  return {
    light: { ...base.cssVars.light, ...accent.cssVars.light },
    dark: { ...base.cssVars.dark, ...accent.cssVars.dark },
  };
}

export function generateInlineStyles(
  config: ThemeConfig,
  mode: "light" | "dark"
): Record<string, string> {
  const theme = buildTheme(config.baseColor, config.theme);
  const vars = mode === "light" ? theme.light : theme.dark;
  const styles: Record<string, string> = {};

  for (const [key, value] of Object.entries(vars)) {
    if (key === "radius") continue;
    styles[`--${key}`] = value;
  }

  styles["--radius"] = RADIUS_VALUES[config.radius];

  const font = FONT_OPTIONS.find((f) => f.value === config.font);
  if (font) {
    styles["--font-sans"] = font.family;
    styles["fontFamily"] = font.family;
  }

  if (config.customColor) {
    const oklch = hexToOklch(config.customColor);
    if (oklch) {
      styles["--primary"] = oklch;
      styles["--sidebar-primary"] = oklch;
    }
  }

  return styles;
}

export function hexToOklch(hex: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;

  let r = Number.parseInt(match[1], 16) / 255;
  let g = Number.parseInt(match[2], 16) / 255;
  let b = Number.parseInt(match[3], 16) / 255;

  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bOklab = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(a * a + bOklab * bOklab);
  let h = (Math.atan2(bOklab, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

export function oklchToHex(oklch: string): string | null {
  const match = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/.exec(oklch);
  if (!match) return null;

  const L = Number.parseFloat(match[1]);
  const C = Number.parseFloat(match[2]);
  const h = (Number.parseFloat(match[3]) * Math.PI) / 180;

  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g_ = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
  g_ = g_ > 0.0031308 ? 1.055 * g_ ** (1 / 2.4) - 0.055 : 12.92 * g_;
  b_ = b_ > 0.0031308 ? 1.055 * b_ ** (1 / 2.4) - 0.055 : 12.92 * b_;

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));

  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g_).toString(16).padStart(2, "0")}${clamp(b_).toString(16).padStart(2, "0")}`;
}

export function generateCssVars(config: ThemeConfig): string {
  const theme = buildTheme(config.baseColor, config.theme);
  const radius = RADIUS_VALUES[config.radius];

  const customOklch = config.customColor
    ? hexToOklch(config.customColor)
    : null;

  const formatVars = (vars: ThemeCssVars, includeRadius: boolean) => {
    const entries = { ...vars };
    if (customOklch) {
      entries.primary = customOklch;
      entries["sidebar-primary"] = customOklch;
    }

    const lines: string[] = [];
    for (const [key, value] of Object.entries(entries)) {
      if (key === "radius") continue;
      lines.push(`  --${key}: ${value};`);
    }
    if (includeRadius) {
      lines.push(`  --radius: ${radius};`);
    }
    return lines.join("\n");
  };

  return `:root {\n${formatVars(theme.light, true)}\n}\n\n.dark {\n${formatVars(theme.dark, false)}\n}`;
}

export function generateFullAppCss(config: ThemeConfig): string {
  const font = FONT_OPTIONS.find((f) => f.value === config.font);
  const fontFamily = font?.family ?? '"Inter Variable", sans-serif';
  const cssVarsBlock = generateCssVars(config);

  const fontImports = ['@import "@fontsource-variable/inter";'];
  if (config.font === "geist") {
    fontImports.push('@import "@fontsource-variable/geist";');
  }

  return `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
${fontImports.join("\n")}

@theme inline {
  --font-sans: ${fontFamily};
  --font-mono: "Inter Variable", monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

${cssVarsBlock}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-sans bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
`;
}
