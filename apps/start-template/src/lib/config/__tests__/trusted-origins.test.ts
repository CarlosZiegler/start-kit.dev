import { describe, expect, it } from "vitest";

import { isOriginTrusted } from "@/lib/config/trusted-origins";

describe("isOriginTrusted", () => {
  it("matches exact origin", () => {
    expect(isOriginTrusted("https://example.com", ["https://example.com"])).toBe(true);
  });

  it("rejects non-matching origin", () => {
    expect(isOriginTrusted("https://evil.com", ["https://example.com"])).toBe(false);
  });

  it("matches wildcard subdomain pattern", () => {
    expect(
      isOriginTrusted("https://my-preview.vercel.app", ["https://*.vercel.app"])
    ).toBe(true);
  });

  it("rejects path traversal through wildcard", () => {
    expect(
      isOriginTrusted("https://evil.com/https://my-app.vercel.app", ["https://*.vercel.app"])
    ).toBe(false);
  });

  it("wildcard matches subdomains with dots since [^/]+ allows dots", () => {
    // [^/]+ matches any character except /, including dots
    expect(
      isOriginTrusted("https://a.b.vercel.app", ["https://*.vercel.app"])
    ).toBe(true);
  });

  it("returns false for empty trusted origins list", () => {
    expect(isOriginTrusted("https://example.com", [])).toBe(false);
  });

  it("does not match origin with trailing slash against clean origin", () => {
    expect(isOriginTrusted("https://example.com/", ["https://example.com"])).toBe(false);
  });

  it("matches when one of multiple trusted origins matches", () => {
    const trusted = [
      "https://example.com",
      "https://staging.example.com",
      "https://*.vercel.app",
    ];
    expect(isOriginTrusted("https://staging.example.com", trusted)).toBe(true);
  });

  it("rejects origin not in multiple trusted origins", () => {
    const trusted = [
      "https://example.com",
      "https://staging.example.com",
    ];
    expect(isOriginTrusted("https://evil.com", trusted)).toBe(false);
  });

  it("handles localhost origins", () => {
    expect(
      isOriginTrusted("http://localhost:3000", ["http://localhost:3000", "http://localhost:3001"])
    ).toBe(true);
  });
});
