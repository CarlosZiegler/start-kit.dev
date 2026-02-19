import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useCookieConsentOptionalMock } = vi.hoisted(() => ({
  useCookieConsentOptionalMock: vi.fn(),
}));

vi.mock("@/lib/cookie-consent-context", () => ({
  useCookieConsentOptional: useCookieConsentOptionalMock,
}));

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

import { ConsentAwareAnalytics } from "@/components/cookie-consent";

describe("ConsentAwareAnalytics", () => {
  beforeEach(() => {
    useCookieConsentOptionalMock.mockReset();
  });

  it("does not render analytics when consent is not granted", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: false,
    });

    render(<ConsentAwareAnalytics />);

    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
  });

  it("renders analytics after analytics consent opt-in", () => {
    useCookieConsentOptionalMock.mockReturnValue({
      canLoadAnalytics: true,
    });

    render(<ConsentAwareAnalytics />);

    expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
  });
});
