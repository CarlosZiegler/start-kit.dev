#!/bin/bash
#
# Redis Docker Management Script
#
# Usage:
#   ./scripts/redis.sh start   - Start Redis
#   ./scripts/redis.sh stop    - Stop Redis
#   ./scripts/redis.sh restart - Restart Redis
#   ./scripts/redis.sh status  - Check Redis status
#   ./scripts/redis.sh logs    - View Redis logs
#

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

wait_for_redis() {
  log_info "Waiting for Redis to be ready..."
  local max_attempts=30
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
      log_info "Redis is ready!"
      echo -e "${GREEN}Connection URL:${NC} redis://localhost:6379"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  log_error "Redis failed to start within ${max_attempts} seconds"
  exit 1
}

case "${1:-start}" in
  start)
    log_info "Starting Redis..."
    docker compose up -d redis
    wait_for_redis
    ;;
  stop)
    log_info "Stopping Redis..."
    docker compose stop redis
    log_info "Redis stopped"
    ;;
  restart)
    log_info "Restarting Redis..."
    docker compose restart redis
    wait_for_redis
    ;;
  status)
    if docker compose ps redis 2>/dev/null | grep -q "running"; then
      log_info "Redis is running"
      docker compose exec -T redis redis-cli info server 2>/dev/null | grep -E "redis_version|uptime_in_seconds" || true
    else
      log_warn "Redis is not running"
    fi
    ;;
  logs)
    docker compose logs -f redis
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
