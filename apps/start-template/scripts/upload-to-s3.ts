/**
 * Upload dist/client assets to S3-compatible storage
 *
 * This script uploads the built client assets to an S3-compatible storage bucket.
 * Works with AWS S3, SeaweedFS, Cloudflare R2, and other S3-compatible providers.
 *
 * Usage:
 *   bun run --env-file=.env scripts/upload-to-s3.ts
 *
 * Required environment variables:
 *   S3_ACCESS_KEY_ID - S3 access key
 *   S3_SECRET_ACCESS_KEY - S3 secret key
 *   S3_BUCKET - Bucket name
 *   S3_ENDPOINT - S3 endpoint (e.g., http://localhost:8333 for SeaweedFS)
 *   S3_REGION - Region (default: us-east-1)
 */

import path from "node:path";
import { file, Glob, S3Client } from "bun";

const requiredEnvVars = [
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "S3_ENDPOINT",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET?.toLowerCase(),
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "us-east-1",
});

const CLIENT_DIR = "./dist/client";
const S3_PREFIX = "client/";

async function uploadAssets() {
  console.info(
    `Uploading assets from ${CLIENT_DIR} to bucket ${process.env.S3_BUCKET}...`
  );

  // TanStack Start outputs _shell.html, not index.html at root
  const hasIndex = await file(path.join(CLIENT_DIR, "index.html")).exists();
  const hasShell = await file(path.join(CLIENT_DIR, "_shell.html")).exists();
  if (!(hasIndex || hasShell)) {
    console.error(`Client directory not found or empty: ${CLIENT_DIR}`);
    console.error("Run 'bun run bun:build' first to generate client assets.");
    process.exit(1);
  }

  // Use onlyFiles: true to skip directories automatically
  const glob = new Glob("**/*");
  let uploadedCount = 0;
  let totalBytes = 0;

  for await (const relativePath of glob.scan({
    cwd: CLIENT_DIR,
    onlyFiles: true,
  })) {
    const filepath = path.join(CLIENT_DIR, relativePath);
    const f = file(filepath);

    // Skip empty files
    if (f.size === 0) {
      continue;
    }

    const key = `${S3_PREFIX}${relativePath}`;
    const contentType = f.type || "application/octet-stream";

    try {
      const data = await f.arrayBuffer();
      await s3.file(key).write(data, { type: contentType });
      uploadedCount++;
      totalBytes += f.size;
      console.info(`  ${key} (${formatBytes(f.size)}, ${contentType})`);
    } catch (error) {
      console.error(`Failed to upload ${key}:`, error);
      process.exit(1);
    }
  }

  console.info("");
  console.info(
    `Upload complete: ${uploadedCount} files, ${formatBytes(totalBytes)} total`
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

uploadAssets().catch((error) => {
  console.error("Upload failed:", error);
  process.exit(1);
});
