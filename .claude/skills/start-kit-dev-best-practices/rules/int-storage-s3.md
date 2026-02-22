# int-storage-s3: Use S3-Compatible Storage Correctly

## Priority: MEDIUM

## Explanation

File storage uses Bun's native `S3Client` with a wrapper in `src/lib/storage/index.ts`. The storage client supports multiple providers (AWS S3, Cloudflare R2, SeaweedFS, DigitalOcean Spaces) and includes retry logic, file validation, and presigned URLs.

## Bad Example

```typescript
// Wrong: direct S3 SDK usage without the storage wrapper
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1" });
await s3.send(new PutObjectCommand({ Bucket: "my-bucket", Key: "file.txt", Body: data }));
```

## Good Example

```typescript
// Using the project's storage client
import { storage } from "@/lib/storage";

// Upload a file with validation
const result = await storage.uploadFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB limit
  allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
  path: `uploads/${userId}/`,
});

// Generate presigned download URL (24h expiry)
const url = await storage.getUrl(fileKey);

// Generate presigned upload URL (for client-side uploads)
const uploadUrl = await storage.presignUpload(fileKey, {
  expiresIn: 3600, // 1 hour
  contentType: "image/png",
});

// Delete a file
await storage.delete(fileKey);

// List files with pagination
const files = await storage.list({ prefix: `uploads/${userId}/`, limit: 20 });
```

## Good Example: oRPC Storage Route

```typescript
// src/orpc/routes/storage.ts
export const storageRouter = orpc.router({
  upload: protectedRlsProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
    }))
    .handler(async ({ input, context }) => {
      const key = `${context.session.user.id}/${nanoid()}-${input.fileName}`;
      const uploadUrl = await storage.presignUpload(key, {
        contentType: input.fileType,
      });

      // Store file metadata in DB (RLS-scoped)
      await context.db.insert(file).values({
        key,
        name: input.fileName,
        type: input.fileType,
        size: input.fileSize,
        provider: "s3",
        bucket: env.S3_BUCKET,
        userId: context.session.user.id,
      });

      return { uploadUrl, key };
    }),
});
```

## Context

- Storage client: `src/lib/storage/index.ts` (Bun S3Client wrapper)
- Supports: AWS S3, Cloudflare R2, SeaweedFS, DigitalOcean Spaces
- File metadata stored in `file` table (RLS-protected)
- Presigned URLs expire after 24h by default
- Upload validation: size limits, allowed MIME types
- Retry logic with exponential backoff built into the storage client
- Environment variables: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`
- Storage provider configured via `STORAGE_PROVIDER` env var
