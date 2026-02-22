/**
 * Start Kit Production Server with Bun
 *
 * A high-performance production server for Start Kit applications that
 * implements intelligent static asset loading with configurable memory management.
 *
 * Features:
 * - Hybrid loading strategy (preload small files, serve large files on-demand)
 * - Unified asset pipeline for local filesystem and S3-compatible storage
 * - Configurable file filtering with include/exclude patterns
 * - Memory-efficient response generation
 * - Production-ready caching headers
 *
 * Environment Variables:
 *
 * PORT (number)
 *   - Server port number
 *   - Default: 3000
 *
 * STORAGE_PROVIDER (string)
 *   - Storage backend for client assets
 *   - Values: "local" (default), "s3", "seaweedfs", "cloudflare-r2", "digitalocean-spaces"
 *
 * ASSET_PRELOAD_MAX_SIZE (number)
 *   - Maximum file size in bytes to preload into memory
 *   - Files larger than this will be served on-demand from disk
 *   - Default: 5242880 (5MB)
 *   - Example: ASSET_PRELOAD_MAX_SIZE=5242880 (5MB)
 *
 * ASSET_PRELOAD_INCLUDE_PATTERNS (string)
 *   - Comma-separated list of glob patterns for files to include
 *   - If specified, only matching files are eligible for preloading
 *   - Patterns are matched against filenames only, not full paths
 *   - Example: ASSET_PRELOAD_INCLUDE_PATTERNS="*.js,*.css,*.woff2"
 *
 * ASSET_PRELOAD_EXCLUDE_PATTERNS (string)
 *   - Comma-separated list of glob patterns for files to exclude
 *   - Applied after include patterns
 *   - Patterns are matched against filenames only, not full paths
 *   - Example: ASSET_PRELOAD_EXCLUDE_PATTERNS="*.map,*.txt"
 *
 * ASSET_PRELOAD_VERBOSE_LOGGING (boolean)
 *   - Enable detailed logging of loaded and skipped files
 *   - Default: false
 *   - Set to "true" to enable verbose output
 *
 * ASSET_PRELOAD_ENABLE_ETAG (boolean)
 *   - Enable ETag generation for preloaded assets
 *   - Default: true
 *   - Set to "false" to disable ETag support
 *
 * ASSET_PRELOAD_ENABLE_GZIP (boolean)
 *   - Enable Gzip compression for eligible assets
 *   - Default: true
 *   - Set to "false" to disable Gzip compression
 *
 * ASSET_PRELOAD_GZIP_MIN_SIZE (number)
 *   - Minimum file size in bytes required for Gzip compression
 *   - Files smaller than this will not be compressed
 *   - Default: 1024 (1KB)
 *
 * ASSET_PRELOAD_GZIP_MIME_TYPES (string)
 *   - Comma-separated list of MIME types eligible for Gzip compression
 *   - Supports partial matching for types ending with "/"
 *   - Default: text/,application/javascript,application/json,application/xml,image/svg+xml
 *
 * Usage:
 *   bun run backend.ts
 */

import path from "node:path";
import { S3Client } from "bun";
import pino from "pino";

// Configuration
const SERVER_PORT = Number(process.env.PORT ?? 3000);
const CLIENT_DIRECTORY = "./dist/client";
const SERVER_ENTRY_POINT = "./dist/server/server.js";

// S3-compatible Storage Mode
const STORAGE_MODE = process.env.STORAGE_PROVIDER ?? "local";
const USE_S3_STORAGE = [
  "s3",
  "seaweedfs",
  "cloudflare-r2",
  "digitalocean-spaces",
].includes(STORAGE_MODE);
const S3_CLIENT_PREFIX = "client/";

// Initialize S3 client if using S3 storage
let s3: S3Client | null = null;
if (USE_S3_STORAGE) {
  const requiredEnvVars = [
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_BUCKET",
  ] as const;
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(
      `Missing required S3 environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }

  s3 = new S3Client({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET?.toLowerCase(),
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
  });
}

// Pino logger for structured logging
const log = pino({
  level: "info",
});

// Helper for formatted table output (presentation, not structured logging)
const writeTable = (line: string) => {
  process.stdout.write(`${line}\n`);
};

// Preloading configuration from environment variables
const MAX_PRELOAD_BYTES = Number(
  process.env.ASSET_PRELOAD_MAX_SIZE ?? 5 * 1024 * 1024 // 5MB default
);

// Parse comma-separated include patterns (no defaults)
const INCLUDE_PATTERNS = (process.env.ASSET_PRELOAD_INCLUDE_PATTERNS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pattern: string) => convertGlobToRegExp(pattern));

// Parse comma-separated exclude patterns (no defaults)
const EXCLUDE_PATTERNS = (process.env.ASSET_PRELOAD_EXCLUDE_PATTERNS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pattern: string) => convertGlobToRegExp(pattern));

// Verbose logging flag
const VERBOSE = process.env.ASSET_PRELOAD_VERBOSE_LOGGING === "true";

// Optional ETag feature
const ENABLE_ETAG =
  (process.env.ASSET_PRELOAD_ENABLE_ETAG ?? "true") === "true";

// Optional Gzip feature
const ENABLE_GZIP =
  (process.env.ASSET_PRELOAD_ENABLE_GZIP ?? "true") === "true";
const GZIP_MIN_BYTES = Number(process.env.ASSET_PRELOAD_GZIP_MIN_SIZE ?? 1024); // 1KB
const GZIP_TYPES = (
  process.env.ASSET_PRELOAD_GZIP_MIME_TYPES ??
  "text/,application/javascript,application/json,application/xml,image/svg+xml"
)
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

// MIME type lookup for S3 files (local files use Bun.file().type)
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".map": "application/json",
};

/**
 * Convert a simple glob pattern to a regular expression
 * Supports * wildcard for matching any characters
 */
function convertGlobToRegExp(globPattern: string): RegExp {
  // Escape regex special chars except *, then replace * with .*
  const escapedPattern = globPattern
    .replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escapedPattern}$`, "i");
}

/**
 * Compute ETag for a given data buffer
 */
function computeEtag(data: Uint8Array): string {
  const hash = Bun.hash(data);
  return `W/"${hash.toString(16)}-${data.byteLength.toString()}"`;
}

/**
 * A file entry yielded by storage adapters.
 * Both local and S3 adapters produce entries with this shape.
 */
interface FileEntry {
  key: string;
  size: number;
  type: string;
  read: () => Promise<Uint8Array>;
}

/**
 * Metadata for preloaded static assets
 */
interface AssetMetadata {
  route: string;
  size: number;
  type: string;
}

/**
 * In-memory asset with ETag and Gzip support
 */
interface InMemoryAsset {
  etag?: string;
  gz?: Uint8Array;
  immutable: boolean;
  raw: Uint8Array;
  size: number;
  type: string;
}

/**
 * Result of static asset preloading process
 */
interface PreloadResult {
  loaded: AssetMetadata[];
  routes: Record<string, (req: Request) => Response | Promise<Response>>;
  skipped: AssetMetadata[];
}

/**
 * Check if a file is eligible for preloading based on configured patterns
 */
function isFileEligibleForPreloading(relativePath: string): boolean {
  const fileName = relativePath.split(/[/\\]/).pop() ?? relativePath;

  // If include patterns are specified, file must match at least one
  if (
    INCLUDE_PATTERNS.length > 0 &&
    !INCLUDE_PATTERNS.some((pattern) => pattern.test(fileName))
  ) {
    return false;
  }

  // If exclude patterns are specified, file must not match any
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(fileName))) {
    return false;
  }

  return true;
}

/**
 * Check if a MIME type is compressible
 */
function isMimeTypeCompressible(mimeType: string): boolean {
  return GZIP_TYPES.some((type) =>
    type.endsWith("/") ? mimeType.startsWith(type) : mimeType === type
  );
}

/**
 * Conditionally compress data based on size and MIME type
 */
function compressDataIfAppropriate(
  data: Uint8Array,
  mimeType: string
): Uint8Array | undefined {
  if (!ENABLE_GZIP) {
    return;
  }
  if (data.byteLength < GZIP_MIN_BYTES) {
    return;
  }
  if (!isMimeTypeCompressible(mimeType)) {
    return;
  }
  try {
    return Bun.gzipSync(data.buffer as ArrayBuffer);
  } catch {
    return;
  }
}

/**
 * Create response handler function with ETag and Gzip support
 */
function createResponseHandler(
  asset: InMemoryAsset
): (req: Request) => Response {
  return (req: Request) => {
    const headers: Record<string, string> = {
      "Content-Type": asset.type,
      "Cache-Control": asset.immutable
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",
    };

    if (ENABLE_ETAG && asset.etag) {
      const ifNone = req.headers.get("if-none-match");
      if (ifNone && ifNone === asset.etag) {
        return new Response(null, {
          status: 304,
          headers: { ETag: asset.etag },
        });
      }
      headers.ETag = asset.etag;
    }

    if (
      ENABLE_GZIP &&
      asset.gz &&
      req.headers.get("accept-encoding")?.includes("gzip")
    ) {
      headers["Content-Encoding"] = "gzip";
      headers["Content-Length"] = String(asset.gz.byteLength);
      const gzCopy = new Uint8Array(asset.gz);
      return new Response(gzCopy, { status: 200, headers });
    }

    headers["Content-Length"] = String(asset.raw.byteLength);
    const rawCopy = new Uint8Array(asset.raw);
    return new Response(rawCopy, { status: 200, headers });
  };
}

/**
 * Create composite glob pattern from include patterns
 */
function createCompositeGlobPattern(): Bun.Glob {
  const raw = (process.env.ASSET_PRELOAD_INCLUDE_PATTERNS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (raw.length === 0) {
    return new Bun.Glob("**/*");
  }
  if (raw.length === 1) {
    return new Bun.Glob(raw[0]);
  }
  return new Bun.Glob(`{${raw.join(",")}}`);
}

/**
 * List files from the local filesystem.
 * Yields FileEntry objects for each file found in the client directory.
 */
async function* listLocalFiles(
  clientDirectory: string
): AsyncGenerator<FileEntry> {
  const glob = createCompositeGlobPattern();
  for await (const relativePath of glob.scan({ cwd: clientDirectory })) {
    const filepath = path.join(clientDirectory, relativePath);

    try {
      const file = Bun.file(filepath);

      if (!(await file.exists()) || file.size === 0) {
        continue;
      }

      yield {
        key: relativePath.split(path.sep).join(path.posix.sep),
        size: file.size,
        type: file.type || "application/octet-stream",
        read: () => file.arrayBuffer().then((ab) => new Uint8Array(ab)),
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "EISDIR") {
        log.error({ filepath, error: error.message }, "Failed to stat file");
      }
    }
  }
}

/**
 * List files from S3-compatible storage.
 * Yields FileEntry objects for each object found under the client/ prefix.
 */
async function* listS3Files(
  client: S3Client,
  prefix: string
): AsyncGenerator<FileEntry> {
  let continuationToken: string | undefined;

  do {
    const result = await client.list({
      prefix,
      startAfter: continuationToken,
      maxKeys: 1000,
    });

    for (const item of result.contents ?? []) {
      const key = item.key;
      if (!key || key.endsWith("/")) {
        continue;
      }

      const relativePath = key.replace(prefix, "");
      const size = Number(item.size ?? 0);
      if (size === 0) {
        continue;
      }

      const ext = path.extname(key).toLowerCase();
      const type = MIME_TYPES[ext] ?? "application/octet-stream";

      const s3Key = key;
      yield {
        key: relativePath,
        size,
        type,
        read: () => client.file(s3Key).bytes(),
      };
    }

    continuationToken = result.nextContinuationToken;
  } while (continuationToken);
}

/**
 * Initialize static routes with intelligent preloading strategy.
 * Accepts any async iterable of FileEntry objects — works identically
 * for local filesystem and S3-compatible storage.
 *
 * Small files are preloaded into memory with ETag and Gzip support.
 * Large files are served on-demand via the entry's read() function.
 */
async function initializeStaticRoutes(
  source: AsyncIterable<FileEntry>
): Promise<PreloadResult> {
  const routes: Record<string, (req: Request) => Response | Promise<Response>> =
    {};
  const loaded: AssetMetadata[] = [];
  const skipped: AssetMetadata[] = [];

  log.info(
    { provider: STORAGE_MODE },
    "Loading static assets"
  );
  if (VERBOSE) {
    log.info(
      { maxPreloadSize: `${(MAX_PRELOAD_BYTES / 1024 / 1024).toFixed(2)} MB` },
      "Preload configuration"
    );
    if (INCLUDE_PATTERNS.length > 0) {
      log.info(
        { patterns: process.env.ASSET_PRELOAD_INCLUDE_PATTERNS ?? "" },
        "Include patterns"
      );
    }
    if (EXCLUDE_PATTERNS.length > 0) {
      log.info(
        { patterns: process.env.ASSET_PRELOAD_EXCLUDE_PATTERNS ?? "" },
        "Exclude patterns"
      );
    }
  }

  let totalPreloadedBytes = 0;

  try {
    for await (const entry of source) {
      const route = `/${entry.key}`;

      const metadata: AssetMetadata = {
        route,
        size: entry.size,
        type: entry.type,
      };

      const matchesPattern = isFileEligibleForPreloading(entry.key);
      const withinSizeLimit = entry.size <= MAX_PRELOAD_BYTES;

      if (matchesPattern && withinSizeLimit) {
        // Preload small files into memory with ETag and Gzip support
        const bytes = new Uint8Array(await entry.read());
        const gz = compressDataIfAppropriate(bytes, metadata.type);
        const etag = ENABLE_ETAG ? computeEtag(bytes) : undefined;
        const asset: InMemoryAsset = {
          raw: bytes,
          gz,
          etag,
          type: metadata.type,
          immutable: true,
          size: bytes.byteLength,
        };
        routes[route] = createResponseHandler(asset);

        loaded.push({ ...metadata, size: bytes.byteLength });
        totalPreloadedBytes += bytes.byteLength;
      } else {
        // Serve large or filtered files on-demand via the entry's read()
        const onDemandRead = entry.read;
        const onDemandType = entry.type;
        const isImmutable =
          route.includes("/assets/") || route.includes("/_build/");

        routes[route] = async (req: Request) => {
          try {
            const bytes = await onDemandRead();

            const headers: Record<string, string> = {
              "Content-Type": onDemandType,
              "Content-Length": String(bytes.byteLength),
              "Cache-Control": isImmutable
                ? "public, max-age=31536000, immutable"
                : "public, max-age=3600",
            };

            if (
              ENABLE_GZIP &&
              bytes.byteLength >= GZIP_MIN_BYTES &&
              isMimeTypeCompressible(onDemandType) &&
              req.headers.get("accept-encoding")?.includes("gzip")
            ) {
              try {
                const compressed = Bun.gzipSync(bytes.buffer as ArrayBuffer);
                headers["Content-Encoding"] = "gzip";
                headers["Content-Length"] = String(compressed.byteLength);
                return new Response(compressed, { status: 200, headers });
              } catch {
                // Fall through to uncompressed response
              }
            }

            return new Response(new Uint8Array(bytes), { status: 200, headers });
          } catch (error) {
            log.error(
              { route, error: String(error) },
              "Failed to serve on-demand asset"
            );
            return new Response("Not Found", { status: 404 });
          }
        };

        skipped.push(metadata);
      }
    }

    // Show detailed file overview only when verbose mode is enabled
    if (VERBOSE && (loaded.length > 0 || skipped.length > 0)) {
      const allFiles = [...loaded, ...skipped].sort((a, b) =>
        a.route.localeCompare(b.route)
      );

      // Calculate max path length for alignment
      const maxPathLength = Math.min(
        Math.max(...allFiles.map((f) => f.route.length)),
        60
      );

      // Format file size with KB and actual gzip size
      const formatFileSize = (bytes: number, gzBytes?: number) => {
        const kb = bytes / 1024;
        const sizeStr = kb < 100 ? kb.toFixed(2) : kb.toFixed(1);

        if (gzBytes !== undefined) {
          const gzKb = gzBytes / 1024;
          const gzStr = gzKb < 100 ? gzKb.toFixed(2) : gzKb.toFixed(1);
          return {
            size: sizeStr,
            gzip: gzStr,
          };
        }

        // Rough gzip estimation (typically 30-70% compression) if no actual gzip data
        const gzipKb = kb * 0.35;
        return {
          size: sizeStr,
          gzip: gzipKb < 100 ? gzipKb.toFixed(2) : gzipKb.toFixed(1),
        };
      };

      if (loaded.length > 0) {
        writeTable("\nPreloaded into memory:");
        writeTable(
          "Path                                          │    Size │ Gzip Size"
        );
        loaded
          .sort((a, b) => a.route.localeCompare(b.route))
          .forEach((file) => {
            const { size, gzip } = formatFileSize(file.size);
            const paddedPath = file.route.padEnd(maxPathLength);
            const sizeStr = `${size.padStart(7)} kB`;
            const gzipStr = `${gzip.padStart(7)} kB`;
            writeTable(`${paddedPath} │ ${sizeStr} │  ${gzipStr}`);
          });
      }

      if (skipped.length > 0) {
        writeTable("\nServed on-demand:");
        writeTable(
          "Path                                          │    Size │ Gzip Size"
        );
        skipped
          .sort((a, b) => a.route.localeCompare(b.route))
          .forEach((file) => {
            const { size, gzip } = formatFileSize(file.size);
            const paddedPath = file.route.padEnd(maxPathLength);
            const sizeStr = `${size.padStart(7)} kB`;
            const gzipStr = `${gzip.padStart(7)} kB`;
            writeTable(`${paddedPath} │ ${sizeStr} │  ${gzipStr}`);
          });
      }
    }

    // Show detailed verbose info if enabled
    if (VERBOSE) {
      if (loaded.length > 0 || skipped.length > 0) {
        const allFiles = [...loaded, ...skipped].sort((a, b) =>
          a.route.localeCompare(b.route)
        );
        writeTable("\nDetailed file information:");
        writeTable(
          "Status       │ Path                            │ MIME Type                    │ Reason"
        );
        for (const file of allFiles) {
          const isPreloaded = loaded.includes(file);
          const status = isPreloaded ? "MEMORY" : "ON-DEMAND";
          const reason =
            !isPreloaded && file.size > MAX_PRELOAD_BYTES
              ? "too large"
              : isPreloaded
                ? "preloaded"
                : "filtered";
          const route =
            file.route.length > 30
              ? `${file.route.substring(0, 27)}...`
              : file.route;
          writeTable(
            `${status.padEnd(12)} │ ${route.padEnd(30)} │ ${file.type.padEnd(28)} │ ${reason.padEnd(10)}`
          );
        }
      } else {
        writeTable("\nNo files found to display");
      }
    }

    // Log summary after the file list
    writeTable(""); // Empty line for separation
    if (loaded.length > 0) {
      log.info(
        {
          fileCount: loaded.length,
          totalSize: `${(totalPreloadedBytes / 1024 / 1024).toFixed(2)} MB`,
        },
        "Preloaded files into memory"
      );
    } else {
      log.info("No files preloaded into memory");
    }

    if (skipped.length > 0) {
      const tooLarge = skipped.filter((f) => f.size > MAX_PRELOAD_BYTES).length;
      const filtered = skipped.length - tooLarge;
      log.info(
        { total: skipped.length, tooLarge, filtered },
        "Files will be served on-demand"
      );
    }
  } catch (error) {
    log.error(
      { provider: STORAGE_MODE, error: String(error) },
      "Failed to load static files"
    );
  }

  return { routes, loaded, skipped };
}

/**
 * Initialize the server
 */
async function initializeServer() {
  log.info("Starting Production Server");

  // Load Start Kit server handler
  let handler: { fetch: (request: Request) => Response | Promise<Response> };
  try {
    const serverModule = (await import(SERVER_ENTRY_POINT)) as {
      default: { fetch: (request: Request) => Response | Promise<Response> };
    };
    handler = serverModule.default;
    log.info("Start Kit application handler initialized");
  } catch (error) {
    log.error({ error: String(error) }, "Failed to load server handler");
    process.exit(1);
  }

  // Build static routes with intelligent preloading
  // Both local and S3 modes go through the same unified pipeline
  const source =
    USE_S3_STORAGE && s3
      ? listS3Files(s3, S3_CLIENT_PREFIX)
      : listLocalFiles(CLIENT_DIRECTORY);

  const { routes } = await initializeStaticRoutes(source);

  /**
   * Add security headers to all responses.
   */
  function addSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // Create Bun server
  const server = Bun.serve({
    port: SERVER_PORT,

    routes: {
      // Serve static assets (preloaded or on-demand)
      ...routes,

      // Fallback to Start Kit handler for all other routes
      "/*": async (req: Request) => {
        try {
          const response = await handler.fetch(req);
          return addSecurityHeaders(response);
        } catch (error) {
          log.error({ error: String(error) }, "Server handler error");
          return addSecurityHeaders(
            new Response("Internal Server Error", { status: 500 })
          );
        }
      },
    },

    // Global error handler
    error(error: Error) {
      log.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Uncaught server error"
      );
      return new Response("Internal Server Error", { status: 500 });
    },
  });

  log.info({ port: server.port }, "Server listening");
}

// Initialize the server
initializeServer().catch((error: unknown) => {
  log.error({ error: String(error) }, "Failed to start server");
  process.exit(1);
});
