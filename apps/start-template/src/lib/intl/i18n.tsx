import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
// biome-ignore lint/style/noExportedImports: <explanation>
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

import { resources } from "./resources";

export type Language = keyof typeof resources;

export const languages = Object.keys(resources);

const runsOnServerSide = typeof window === "undefined";
const i18nCookieName = "i18nextLng";
export const setSSRLanguage = createIsomorphicFn().server(async () => {
	const language = getCookie(i18nCookieName) || "en";
	// Sync the i18n instance so server-rendered translations match the
	// language the client will detect from the same cookie.
	// Resources are already preloaded so changeLanguage is synchronous.
	if (i18n.language !== language) {
		await i18n.changeLanguage(language);
	}
	return language;
});

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.use(
		resourcesToBackend(
			(language: string) => import(`./locales/${language}.ts`),
		),
	)
	.init({
		showSupportNotice: false,
		resources,
		interpolation: {
			escapeValue: false,
		},
		defaultNS: "translation",
		detection: {
			order: ["cookie"],
			lookupCookie: i18nCookieName,
			caches: ["cookie"],
			cookieMinutes: 60 * 24 * 365,
		},
		fallbackLng: "en",
		debug: false,
		preload: runsOnServerSide ? languages : [],
	});

/**
 * Change the application language and update the cookie
 * @param language - Language code (e.g., 'en', 'fr', 'es')
 */
export const changeLanguage = async (language: string) => {
	if (languages.includes(language)) {
		await i18n.changeLanguage(language);

		return true;
	}

	return false;
};

export default i18n;
