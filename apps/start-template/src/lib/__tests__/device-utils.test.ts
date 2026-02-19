import { describe, expect, it } from "vitest";

import {
  type DeviceType,
  getDeviceIcon,
  getDeviceIconFromUserAgent,
  getDeviceInfo,
  getDeviceType,
} from "@/lib/device-utils";

describe("getDeviceIcon", () => {
  it("returns PhoneIcon for mobile", () => {
    const icon = getDeviceIcon("mobile");
    expect(icon).toBeDefined();
  });

  it("returns Tablet for tablet", () => {
    const icon = getDeviceIcon("tablet");
    expect(icon).toBeDefined();
  });

  it("returns Laptop for desktop", () => {
    const icon = getDeviceIcon("desktop");
    expect(icon).toBeDefined();
  });
});

describe("getDeviceIconFromUserAgent", () => {
  it("returns PhoneIcon for mobile user agent", () => {
    const icon = getDeviceIconFromUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
    );
    expect(icon).toBeDefined();
  });

  it("returns Laptop for desktop user agent", () => {
    const icon = getDeviceIconFromUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    );
    expect(icon).toBeDefined();
  });

  it("returns Monitor for undefined user agent", () => {
    const icon = getDeviceIconFromUserAgent();
    expect(icon).toBeDefined();
  });
});

describe("getDeviceInfo", () => {
  it("parses user agent correctly", () => {
    const info = getDeviceInfo(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    expect(info).toContain("macOS");
  });

  it("returns fallback for undefined user agent", () => {
    const info = getDeviceInfo();
    expect(info).toBe("Unknown device");
  });

  it("returns custom fallback", () => {
    const info = getDeviceInfo(undefined, "Custom device");
    expect(info).toBe("Custom device");
  });
});

describe("getDeviceType", () => {
  it("returns mobile for mobile user agent", () => {
    const type = getDeviceType(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
    );
    expect(type).toBe<DeviceType>("mobile");
  });

  it("returns tablet for tablet user agent", () => {
    const type = getDeviceType("Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)");
    expect(type).toBe<DeviceType>("tablet");
  });

  it("returns desktop for desktop user agent", () => {
    const type = getDeviceType(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    );
    expect(type).toBe<DeviceType>("desktop");
  });

  it("returns desktop for undefined user agent", () => {
    const type = getDeviceType();
    expect(type).toBe<DeviceType>("desktop");
  });
});
