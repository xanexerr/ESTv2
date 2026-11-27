#!/bin/sh
set -e

echo "[entrypoint] Starting ESTv2 container..."

# 1. Sync Prisma schema with PostgreSQL (with retry in case DB is still initializing)
MAX_RETRIES=10
RETRY_COUNT=0
until prisma db push --skip-generate; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] ERROR: prisma db push failed after ${MAX_RETRIES} attempts."
    exit 1
  fi
  echo "[entrypoint] Database not ready yet, retrying in 3s (${RETRY_COUNT}/${MAX_RETRIES})..."
  sleep 3
done
echo "[entrypoint] Prisma schema synced successfully."

# 2. Optional safe auto-seed (ONLY when database has 0 users so existing data is never wiped)
if [ "${AUTO_SEED:-false}" = "true" ]; then
  USER_COUNT=$(node -e '
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    prisma.user.count()
      .then((c) => { console.log(c); return prisma.$disconnect(); })
      .catch((e) => { console.error(e); process.exit(1); });
  ')
  if [ "$USER_COUNT" = "0" ]; then
    echo "[entrypoint] Database is empty (0 users). Running initial seed..."
    tsx prisma/seed.ts
    echo "[entrypoint] Initial seed completed."
  else
    echo "[entrypoint] Database already has ${USER_COUNT} user(s). Skipping seed."
  fi
fi

# 3. Ensure upload directories exist
mkdir -p /app/public/img /app/public/uploads/evidence

echo "[entrypoint] Launching Next.js server on port ${PORT:-3000}..."
exec node server.js
