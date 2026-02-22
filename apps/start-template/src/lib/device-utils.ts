import { Laptop, Monitor, Phone as Smartphone, Tablet } from "lucide-react";
import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "tablet" | "desktop";

export const DEVICE_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Laptop,
};

export const DEFAULT_DEVICE_ICON = Monitor;

export function getDeviceIconRendered(type: DeviceType | undefined) {
  return DEVICE_ICONS[type as DeviceType] || DEFAULT_DEVICE_ICON;
}

export function getDeviceIconFromUserAgent(
  userAgent: string | null | undefined
) {
  if (!userAgent) {
    return Monitor;
  }

  const deviceType = getDeviceType(userAgent);
  return getDeviceIconRendered(deviceType);
}

export function getDeviceInfo(
  userAgent: string | null | undefined,
  fallback = "Unknown device"
): string {
  if (!userAgent) {
    return fallback;
  }

  const parser = new UAParser(userAgent);
  const osName = parser.getOS().name;
  const browserName = parser.getBrowser().name;
  return `${osName}, ${browserName}`;
}

export function getDeviceType(userAgent?: string): DeviceType {
  if (!userAgent) {
    return "desktop";
  }

  const deviceType = new UAParser(userAgent).getDevice().type;
  if (deviceType === "mobile") {
    return "mobile";
  }
  if (deviceType === "tablet") {
    return "tablet";
  }
  return "desktop";
}
