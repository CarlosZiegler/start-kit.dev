import { describe, expect, it } from "bun:test";
import { parseThemeArgs } from "../theme-apply";

describe("parseThemeArgs", () => {
  it("returns null when no theme flags are present", () => {
    expect(parseThemeArgs(["create", "my-app"])).toBeNull();
  });

  it("parses all four flags", () => {
    const result = parseThemeArgs([
      "create",
      "my-app",
      "--theme",
      "blue",
      "--base-color",
      "zinc",
      "--radius",
      "md",
      "--font",
      "geist",
    ]);

    expect(result).toEqual({
      theme: "blue",
      baseColor: "zinc",
      radius: "md",
      font: "geist",
    });
  });

  it("uses defaults for missing flags when at least one flag is present", () => {
    const result = parseThemeArgs(["create", "my-app", "--theme", "red"]);

    expect(result).toEqual({
      theme: "red",
      baseColor: "neutral",
      radius: "lg",
      font: "inter",
    });
  });

  it("falls back to defaults for invalid theme value", () => {
    const result = parseThemeArgs(["create", "--theme", "nonexistent"]);

    expect(result).not.toBeNull();
    expect(result!.theme).toBe("neutral");
  });

  it("falls back to defaults for invalid base-color value", () => {
    const result = parseThemeArgs(["create", "--base-color", "nope"]);

    expect(result).not.toBeNull();
    expect(result!.baseColor).toBe("neutral");
  });

  it("falls back to defaults for invalid radius value", () => {
    const result = parseThemeArgs(["create", "--radius", "huge"]);

    expect(result).not.toBeNull();
    expect(result!.radius).toBe("lg");
  });

  it("falls back to defaults for invalid font value", () => {
    const result = parseThemeArgs(["create", "--font", "comic-sans"]);

    expect(result).not.toBeNull();
    expect(result!.font).toBe("inter");
  });

  it("handles flags without project name", () => {
    const result = parseThemeArgs(["create", "--theme", "blue"]);

    expect(result).toEqual({
      theme: "blue",
      baseColor: "neutral",
      radius: "lg",
      font: "inter",
    });
  });
});
