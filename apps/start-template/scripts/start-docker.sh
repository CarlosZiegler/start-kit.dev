#!/bin/bash
#
# Start Docker SeaweedFS and TanStack Start Application
#
# This script:
# 1. Starts SeaweedFS via Docker Compose
# 2. Waits for SeaweedFS to be healthy
# 3. Creates the bucket if needed
# 4. Builds the application
# 5. Uploads client assets to SeaweedFS
# 6. Starts the backend server
#
# Usage:
#   ./scripts/start-docker.sh
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - Bun installed
#   - .env file configured with S3 settings

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check for required tools
check_requirements() {
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
  fi

  if ! command -v bun &> /dev/null; then
    log_error "Bun is not installed. Please install Bun first."
    exit 1
  fi

  if [ ! -f ".env" ]; then
    log_error ".env file not found. Copy .env.example to .env and configure S3 settings."
    exit 1
  fi
}

# Load environment variables
load_env() {
  set -a
  source .env
  set +a
}

# Start SeaweedFS
start_seaweedfs() {
  log_info "Starting SeaweedFS..."
  docker compose up -d seaweedfs

  log_info "Waiting for SeaweedFS to be healthy..."
  local max_attempts=30
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "http://localhost:9333/cluster/status" > /dev/null 2>&1; then
      log_info "SeaweedFS is healthy!"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  log_error "SeaweedFS failed to start within ${max_attempts} seconds"
  exit 1
}

# Create bucket using S3 API
create_bucket() {
  local bucket="${S3_BUCKET:-app-assets}"
  log_info "Ensuring bucket '${bucket}' exists..."

  # SeaweedFS auto-creates buckets, but we can explicitly create via S3 API
  curl -sf -X PUT "http://localhost:8333/${bucket}" > /dev/null 2>&1 || true

  log_info "Bucket '${bucket}' is ready"
}

# Build the application
build_app() {
  log_info "Building application..."
  bun run bun:build
}

# Upload assets to SeaweedFS
upload_assets() {
  log_info "Uploading assets to SeaweedFS..."
  bun run --env-file=.env scripts/upload-to-s3.ts
}

# Start the backend
start_backend() {
  log_info "Starting backend server with STORAGE_PROVIDER=seaweedfs..."
  STORAGE_PROVIDER=seaweedfs exec bun run --env-file=.env backend.ts
}

# Main
main() {
  log_info "Starting Docker + SeaweedFS integration..."

  check_requirements
  load_env
  start_seaweedfs
  create_bucket
  build_app
  upload_assets
  start_backend
}

main "$@"
