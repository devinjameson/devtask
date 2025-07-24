#!/bin/bash
set -e

echo "🔧 Setting up .env.test file with Supabase test credentials..."

# Check if test Supabase is running
if ! supabase status --workdir supabase-test &>/dev/null; then
    echo "❌ Test Supabase is not running. Please start it first with:"
    echo "   pnpm test:supabase"
    exit 1
fi

# Copy from .env.test.example if .env.test doesn't exist
if [[ ! -f .env.test ]]; then
    if [[ -f .env.test.example ]]; then
        echo "📋 Copying .env.test.example to .env.test..."
        cp .env.test.example .env.test
    else
        echo "❌ .env.test.example not found!"
        exit 1
    fi
fi

# Get credentials from test Supabase
echo "🔑 Extracting Supabase test credentials..."
SUPABASE_OUTPUT=$(supabase status --workdir supabase-test -o env)

# Extract specific keys
ANON_KEY=$(echo "$SUPABASE_OUTPUT" | grep '^ANON_KEY=' | cut -d'"' -f2)
SERVICE_ROLE_KEY=$(echo "$SUPABASE_OUTPUT" | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)

if [[ -z "$ANON_KEY" || -z "$SERVICE_ROLE_KEY" ]]; then
    echo "❌ Failed to extract credentials from test Supabase"
    exit 1
fi

# Replace values after = for specific env vars
echo "✏️  Updating .env.test with actual credentials..."
sed -i '' "s/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY/" .env.test
sed -i '' "s/^SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY/" .env.test

echo "✅ .env.test file updated successfully!"

