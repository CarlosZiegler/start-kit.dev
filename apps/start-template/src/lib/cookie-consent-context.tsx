import type { ReactNode } from "react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buildCookieConsent,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  type CookieConsentPreferences,
  type CookieConsentState,
  readCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  consent: CookieConsentState | null;
  isLoaded: boolean;
  hasDecision: boolean;
  canLoadAnalytics: boolean;
  canLoadMarketing: boolean;
  canLoadReplay: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (
    preferences: Partial<Omit<CookieConsentPreferences, "essential">>
  ) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const applyConsent = useCallback((nextConsent: CookieConsentState) => {
    saveCookieConsent(nextConsent);
    setConsent(nextConsent);
  }, []);

  const acceptAll = useCallback(() => {
    applyConsent(
      buildCookieConsent("accept_all", {
        analytics: true,
        marketing: true,
        replay: true,
      })
    );
  }, [applyConsent]);

  const rejectAll = useCallback(() => {
    applyConsent(
      buildCookieConsent("reject_all", {
        analytics: false,
        marketing: false,
        replay: false,
      })
    );
  }, [applyConsent]);

  const savePreferences = useCallback(
    (preferences: Partial<Omit<CookieConsentPreferences, "essential">>) => {
      applyConsent(
        buildCookieConsent("preferences", {
          analytics: preferences.analytics ?? false,
          marketing: preferences.marketing ?? false,
          replay: preferences.replay ?? false,
        })
      );
    },
    [applyConsent]
  );

  useEffect(() => {
    const syncConsent = () => {
      setConsent(readCookieConsent());
      setIsLoaded(true);
    };

    syncConsent();

    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
        syncConsent();
      }
    };

    const onConsentUpdate = () => {
      syncConsent();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onConsentUpdate);
    };
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      isLoaded,
      hasDecision: consent !== null,
      canLoadAnalytics: consent?.preferences.analytics ?? false,
      canLoadMarketing: consent?.preferences.marketing ?? false,
      canLoadReplay: consent?.preferences.replay ?? false,
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [consent, isLoaded, acceptAll, rejectAll, savePreferences]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (context === null) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider"
    );
  }

  return context;
}

function noop() {
  // Intentionally empty.
}

export function useCookieConsentOptional(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);

  if (context === null) {
    return {
      consent: null,
      isLoaded: false,
      hasDecision: false,
      canLoadAnalytics: false,
      canLoadMarketing: false,
      canLoadReplay: false,
      acceptAll: noop,
      rejectAll: noop,
      savePreferences: noop,
    };
  }

  return context;
}
