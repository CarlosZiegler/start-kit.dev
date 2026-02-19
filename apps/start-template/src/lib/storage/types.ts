export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UploadResult {
  contentType?: string;
  key: string;
  size: number;
  url?: string;
}

export interface DownloadResult {
  contentType?: string;
  data: Uint8Array;
  size: number;
}

export interface PresignOptions {
  contentType?: string;
  expiresIn: number;
  method?: "GET" | "PUT" | "DELETE";
}

export interface ListOptions {
  limit?: number;
  prefix?: string;
  startAfter?: string;
}

export interface ListResult {
  files: Array<{
    key: string;
    size: number;
    lastModified: Date;
    etag?: string;
    contentType?: string;
  }>;
  isTruncated: boolean;
  nextMarker?: string;
}
