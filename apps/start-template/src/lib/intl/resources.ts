import de from "./locales/de";
import en from "./locales/en";
import pt from "./locales/pt";

export const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
  pt: {
    translation: pt,
  },
} as const;

export type Language = keyof typeof resources;
