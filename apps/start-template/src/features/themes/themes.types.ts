export type ThemeCssVars = Record<string, string>;

export type ThemeDefinition = {
  name: string;
  title: string;
  cssVars: {
    light: ThemeCssVars;
    dark: ThemeCssVars;
  };
};

export type BaseColorName = "neutral" | "stone" | "zinc" | "gray";

export type ThemeName =
  | BaseColorName
  | "amber"
  | "blue"
  | "cyan"
  | "emerald"
  | "fuchsia"
  | "green"
  | "indigo"
  | "lime"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "rose"
  | "sky"
  | "teal"
  | "violet"
  | "yellow";

export type RadiusPreset = "none" | "sm" | "md" | "lg" | "xl";

export type FontOption = "inter" | "geist" | "system";

export type ThemeConfig = {
  baseColor: BaseColorName;
  theme: ThemeName;
  radius: RadiusPreset;
  font: FontOption;
  customColor?: string;
};
