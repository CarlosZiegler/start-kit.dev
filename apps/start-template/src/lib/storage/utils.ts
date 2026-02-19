const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/svg",
]);

export function validateFile(file: File | { type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${Array.from(
        ALLOWED_MIME_TYPES
      ).join(", ")}`,
    };
  }

  return { valid: true };
}

export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/svg": "svg",
  };

  return mimeToExt[mimeType] ?? "png";
}

export function generateStorageKey(
  purpose: string,
  userId: string,
  fileName: string
): string {
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()
    : getFileExtensionFromName(fileName);
  const sanitizedFileName = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const uuid = crypto.randomUUID();

  return `${purpose}/${userId}/${sanitizedFileName}-${uuid}.${ext}`;
}

export function generateStorageKeyFromMimeType(
  purpose: string,
  userId: string,
  mimeType: string
): string {
  const ext = getFileExtension(mimeType);
  const uuid = crypto.randomUUID();

  return `${purpose}/${userId}/${uuid}.${ext}`;
}

function getFileExtensionFromName(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] ?? "bin") : "bin";
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error("Retry failed");
}
