# SeaweedFS Migration Design

Migrate from MinIO to SeaweedFS for S3-compatible object storage.

## Context

MinIO Community Edition entered maintenance mode December 2025. No new features, selective security patches, no community PRs. SeaweedFS provides S3-compatible API with active development.

## Current State

- MinIO in docker-compose on ports 9000/9001
- Bun S3Client for storage operations
- Operations used: upload, download, delete, list, presign, exists, stat
- Dev environment, no data migration needed

## Design

### Docker Compose Changes

Replace MinIO service:

```yaml
services:
  seaweedfs:
    image: chrislusf/seaweedfs
    ports:
      - "8333:8333"   # S3 API
      - "9333:9333"   # Master UI
      - "8888:8888"   # Filer UI
    command: 'server -s3 -s3.port=8333 -filer -volume.max=5'
    volumes:
      - seaweedfs_data:/data
    environment:
      WEED_S3_AUTH_KEY: ${S3_ACCESS_KEY_ID:-minioadmin}
      WEED_S3_AUTH_SECRET: ${S3_SECRET_ACCESS_KEY:-minioadmin}
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9333/cluster/status"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  seaweedfs_data:
  redis_data:
```

### Environment Changes

```bash
# Update
S3_ENDPOINT=http://localhost:8333  # was 9000
STORAGE_PROVIDER=seaweedfs         # was minio

# Remove
MINIO_ROOT_USER
MINIO_ROOT_PASSWORD
```

### Files Modified

| File | Change |
|------|--------|
| docker-compose.yml | Replace minio with seaweedfs service |
| .env.example | Update endpoint, remove MINIO_* vars |

### Files Unchanged

- `src/lib/storage/index.ts` - standard S3 API
- `scripts/upload-to-minio.ts` - works as-is
- All other S3-consuming code

## Web UIs

- Filer UI: `http://localhost:8888` - browse files
- Master UI: `http://localhost:9333` - cluster status

## Testing

1. `docker compose down -v`
2. `docker compose up -d`
3. Check Filer UI at localhost:8888
4. Test file upload/download in app
5. Verify presigned URLs work

## Risks

- S3 auth config may need adjustment
- Presigned URL format may vary slightly
