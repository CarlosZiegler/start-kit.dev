import { describe, expect, it } from "bun:test";
import { buildTheme, generateFullAppCss, hexToOklch } from "../theme-utils";

describe("buildTheme", () => {
  it("returns base-only vars when theme is a base color", () => {
    const result = buildTheme("neutral", "neutral");
    expect(result.light.background).toBe("oklch(1 0 0)");
    expect(result.light.primary).toBe("oklch(0.205 0 0)");
  });

  it("merges base + accent when theme is an accent color", () => {
    const result = buildTheme("neutral", "blue");
    // base background from neutral
    expect(result.light.background).toBe("oklch(1 0 0)");
    // primary overridden by blue accent
    expect(result.light.primary).toBe("oklch(0.488 0.243 264.376)");
  });

  it("falls back to first theme when base color is invalid", () => {
    const result = buildTheme("invalid", "blue");
    expect(result.light.background).toBe("oklch(1 0 0)");
  });

  it("returns base-only when accent is not found", () => {
    const result = buildTheme("zinc", "nonexistent");
    expect(result.light.primary).toBe("oklch(0.21 0.006 285.885)");
  });
});

describe("hexToOklch", () => {
  it("converts black", () => {
    const result = hexToOklch("#000000");
    expect(result).toBe("oklch(0.000 0.000 0.0)");
  });

  it("converts white", () => {
    const result = hexToOklch("#ffffff");
    expect(result).toMatch(/^oklch\(1\.000 0\.000/);
  });

  it("returns null for invalid hex", () => {
    expect(hexToOklch("not-a-color")).toBeNull();
  });

  it("handles hex without hash", () => {
    expect(hexToOklch("ff0000")).not.toBeNull();
  });
});

describe("generateFullAppCss", () => {
  const defaultConfig = {
    baseColor: "neutral" as const,
    theme: "blue" as const,
    radius: "md" as const,
    font: "inter" as const,
  };

  it("contains tailwind imports", () => {
    const css = generateFullAppCss(defaultConfig);
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@import "tw-animate-css"');
  });

  it("contains @theme inline block", () => {
    const css = generateFullAppCss(defaultConfig);
    expect(css).toContain("@theme inline");
  });

  it("contains :root and .dark blocks", () => {
    const css = generateFullAppCss(defaultConfig);
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("contains @layer base block", () => {
    const css = generateFullAppCss(defaultConfig);
    expect(css).toContain("@layer base");
  });

  it("contains marquee utilities block", () => {
    const css = generateFullAppCss(defaultConfig);
    expect(css).toContain("@layer utilities");
    expect(css).toContain("tech-marquee-scroll");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("includes geist font import when font is geist", () => {
    const css = generateFullAppCss({ ...defaultConfig, font: "geist" });
    expect(css).toContain('@import "@fontsource-variable/geist"');
    expect(css).toContain('"Geist Variable", sans-serif');
  });

  it("does not include geist import for inter font", () => {
    const css = generateFullAppCss({ ...defaultConfig, font: "inter" });
    expect(css).not.toContain("fontsource-variable/geist");
  });

  it("sets correct radius value", () => {
    const css = generateFullAppCss({ ...defaultConfig, radius: "md" });
    expect(css).toContain("--radius: 0.5rem;");
  });
});
