import i18next, { type Language } from "./i18n";

export async function getI18n(lng: Language) {
  // IMPORTANT: do not call `changeLanguage()` on a shared singleton during SSR.
  // Use a fixed translator for the requested language instead.
  // (If you need fully localized SSR HTML, prefer a per-request i18n instance.)

  return {
    t: i18next.getFixedT(lng),
    i18n: i18next,
  };
}
