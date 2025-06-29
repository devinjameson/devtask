#!/bin/bash
set -e

echo "🛑 Stopping Supabase and removing all local data..."
supabase stop --no-backup

echo "🚀 Restarting Supabase..."
supabase start

echo "🧬 Running Prisma migrations..."
pnpm prisma migrate dev --name init

echo "🌱 Seeding database..."
pnpm prisma db seed

echo "✅ Local database reset complete."
