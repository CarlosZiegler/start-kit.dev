import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCookieConsent,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

describe("cookie consent storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds consent with essential always enabled", () => {
    const consent = buildCookieConsent("preferences", {
      analytics: true,
      marketing: false,
      replay: true,
    });

    expect(consent.version).toBe(1);
    expect(consent.preferences.essential).toBe(true);
    expect(consent.preferences.analytics).toBe(true);
    expect(consent.preferences.marketing).toBe(false);
    expect(consent.preferences.replay).toBe(true);
  });

  it("returns null when no consent is stored", () => {
    expect(readCookieConsent()).toBeNull();
  });

  it("roundtrips consent through localStorage", () => {
    const consent = buildCookieConsent("accept_all", {
      analytics: true,
      marketing: true,
      replay: true,
    });

    saveCookieConsent(consent);

    expect(readCookieConsent()).toEqual(consent);
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toContain(
      '"decision":"accept_all"'
    );
  });

  it("ignores invalid stored payloads", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 2 })
    );

    expect(readCookieConsent()).toBeNull();
  });

  it("dispatches update event when consent is saved", () => {
    const consent = buildCookieConsent("reject_all", {
      analytics: false,
      marketing: false,
      replay: false,
    });
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    saveCookieConsent(consent);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const firstCall = dispatchSpy.mock.calls.at(0);
    expect(firstCall?.at(0)).toBeInstanceOf(CustomEvent);
    const event = firstCall?.at(0) as CustomEvent;
    expect(event.type).toBe(COOKIE_CONSENT_UPDATED_EVENT);
    expect(event.detail).toEqual(consent);
  });
});
