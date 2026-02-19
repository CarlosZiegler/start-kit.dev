const DOMAIN_PATTERN =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function isValidDomain(value: string): boolean {
  return DOMAIN_PATTERN.test(value);
}

export function isValidPostgresUrl(value: string): boolean {
  return value.startsWith("postgresql://") || value.startsWith("postgres://");
}

export function isValidRedisUrl(value: string): boolean {
  return value.startsWith("redis://") || value.startsWith("rediss://");
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidAppName(value: string): boolean {
  return value.length >= 2 && value.length <= 50;
}

export function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
