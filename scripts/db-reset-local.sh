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

echo "🧪 Setting up test database..."
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "DROP DATABASE IF EXISTS postgres_test;" -d postgres || true
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c "CREATE DATABASE postgres_test;" -d postgres
pnpm test:db:push

echo "✅ Local database reset complete."
