#!/bin/bash
set -e

echo "🛑 Stopping Supabase and removing all local data..."
supabase stop --no-backup

echo "🚀 Restarting Supabase..."
supabase start

echo "🧬 Running Prisma migrations..."
pnpm prisma migrate dev

echo "🌱 Seeding database..."
pnpm prisma db seed

echo "✅ Dev database reset complete."
