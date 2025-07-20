#!/bin/bash
set -e

echo "🛑 Stopping test Supabase and removing all local test data..."
supabase stop --workdir supabase-test --no-backup || true

echo "🚀 Starting test Supabase..."
supabase start --workdir supabase-test

echo "🧪 Setting up test database..."
pnpm test:db:migrate

echo "✅ Test database reset complete."
