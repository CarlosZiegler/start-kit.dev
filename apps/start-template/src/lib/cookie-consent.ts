export const COOKIE_CONSENT_STORAGE_KEY = "starttemplate_cookie_consent_v1";
export const COOKIE_CONSENT_UPDATED_EVENT =
  "starttemplate:cookie-consent-updated";

export type CookieConsentDecision = "accept_all" | "reject_all" | "preferences";

export type CookieConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  replay: boolean;
};

export type CookieConsentState = {
  version: 1;
  decision: CookieConsentDecision;
  updatedAt: string;
  preferences: CookieConsentPreferences;
};

const DEFAULT_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  replay: false,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isConsentDecision(value: unknown): value is CookieConsentDecision {
  return (
    value === "accept_all" || value === "reject_all" || value === "preferences"
  );
}

function parseStoredConsent(raw: string | null): CookieConsentState | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isObject(parsed) || parsed.version !== 1) {
      return null;
    }

    if (!isObject(parsed.preferences)) {
      return null;
    }

    const { preferences } = parsed;

    if (
      typeof preferences.analytics !== "boolean" ||
      typeof preferences.marketing !== "boolean" ||
      typeof preferences.replay !== "boolean" ||
      !isConsentDecision(parsed.decision)
    ) {
      return null;
    }

    return {
      version: 1,
      decision: parsed.decision,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      preferences: {
        essential: true,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        replay: preferences.replay,
      },
    };
  } catch {
    return null;
  }
}

export function buildCookieConsent(
  decision: CookieConsentDecision,
  overrides?: Partial<Omit<CookieConsentPreferences, "essential">>
): CookieConsentState {
  return {
    version: 1,
    decision,
    updatedAt: new Date().toISOString(),
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...overrides,
      essential: true,
    },
  };
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredConsent(
    window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
  );
}

export function saveCookieConsent(consent: CookieConsentState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(consent)
  );
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent })
  );
}
