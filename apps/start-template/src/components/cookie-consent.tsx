import { Analytics } from "@vercel/analytics/react";

import { useCookieConsentOptional } from "@/lib/cookie-consent-context";

export { CookieConsentBanner } from "@/components/cookie-consent-banner";

export function ConsentAwareAnalytics() {
  const { canLoadAnalytics } = useCookieConsentOptional();

  if (!canLoadAnalytics) {
    return null;
  }

  return <Analytics />;
}

export function ConsentAwareMarketing() {
  const { canLoadMarketing } = useCookieConsentOptional();

  if (!canLoadMarketing) {
    return null;
  }

  return null;
}

export function ConsentAwareReplay() {
  const { canLoadReplay } = useCookieConsentOptional();

  if (!canLoadReplay) {
    return null;
  }

  return null;
}
