import { S3Client } from "bun";

import { env } from "@/lib/env.server";

import type {
  DownloadResult,
  ListOptions,
  ListResult,
  PresignOptions,
  UploadOptions,
  UploadResult,
} from "./types";

import { generateStorageKey, retryWithBackoff, validateFile } from "./utils";

// Initialize S3 client with env configuration
const s3 = new S3Client({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET?.toLowerCase(),
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
});

export interface UploadFileOptions extends UploadOptions {
  fileName: string;
  organizationId?: string;
  purpose: string;
  userId: string;
}

async function upload(
  key: string,
  data: Uint8Array,
  options?: UploadOptions
): Promise<UploadResult> {
  const s3File = s3.file(key);
  await retryWithBackoff(async () => {
    const result = await s3File.write(data, { type: options?.contentType });
    return result;
  });
  return { key, size: data.length, contentType: options?.contentType };
}

async function download(key: string): Promise<DownloadResult> {
  const s3File = s3.file(key);
  const bytes = await retryWithBackoff(() => s3File.bytes());
  const stat = await retryWithBackoff(() => s3.stat(key));
  return { data: bytes, contentType: stat.type, size: bytes.length };
}

async function deleteFile(key: string): Promise<void> {
  await retryWithBackoff(() => s3.file(key).delete());
}

function exists(key: string): Promise<boolean> {
  return retryWithBackoff(() => s3.file(key).exists());
}

function getUrl(key: string, expiresIn = 86_400): string {
  return s3.file(key).presign({ expiresIn });
}

function presign(key: string, options: PresignOptions): string {
  return s3.file(key).presign({
    expiresIn: options.expiresIn,
    method: options.method ?? "PUT",
    type: options.contentType,
  });
}

async function list(options?: ListOptions): Promise<ListResult> {
  const result = await retryWithBackoff(() =>
    s3.list({
      prefix: options?.prefix,
      maxKeys: options?.limit,
      startAfter: options?.startAfter,
    })
  );
  return {
    files:
      result?.contents?.map((item) => ({
        key: item.key ?? "",
        size: Number(item.size ?? 0),
        lastModified: item.lastModified
          ? new Date(item.lastModified)
          : new Date(),
        etag: item.eTag,
      })) ?? [],
    isTruncated: result?.isTruncated ?? false,
    nextMarker: result?.nextContinuationToken,
  };
}

async function uploadFile(
  file: File,
  options: UploadFileOptions
): Promise<UploadResult & { key: string }> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const key = generateStorageKey(
    options.purpose,
    options.userId,
    options.fileName
  );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await upload(key, bytes, {
    contentType: file.type,
    metadata: {
      userId: options.userId,
      organizationId: options.organizationId ?? "",
      purpose: options.purpose,
      fileName: options.fileName,
      ...options.metadata,
    },
  });
  return { ...result, key };
}

function presignUpload(
  fileName: string,
  purpose: string,
  userId: string,
  expiresIn = 3600,
  _organizationId?: string
): { key: string; url: string } {
  const key = generateStorageKey(purpose, userId, fileName);
  const url = presign(key, { expiresIn, method: "PUT" });
  return { key, url };
}

// Single exported storage object with all methods
export const storage = {
  upload,
  uploadFile,
  download,
  delete: deleteFile,
  exists,
  getUrl,
  presign,
  presignUpload,
  list,
};
