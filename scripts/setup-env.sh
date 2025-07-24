#!/bin/bash
set -e

echo "🔧 Setting up .env file with Supabase credentials..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Please start it first with:"
    echo "   supabase start"
    exit 1
fi

# Copy from .env.example if .env doesn't exist
if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Get credentials from Supabase
echo "🔑 Extracting Supabase credentials..."
SUPABASE_OUTPUT=$(supabase status -o env 2>/dev/null)

# Extract specific keys
ANON_KEY=$(echo "$SUPABASE_OUTPUT" | grep '^ANON_KEY=' | cut -d'"' -f2)
SERVICE_ROLE_KEY=$(echo "$SUPABASE_OUTPUT" | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)

if [[ -z "$ANON_KEY" || -z "$SERVICE_ROLE_KEY" ]]; then
    echo "❌ Failed to extract credentials from Supabase"
    exit 1
fi

# Replace values after = for specific env vars
echo "✏️  Updating .env with actual credentials..."
sed -i '' "s/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY/" .env
sed -i '' "s/^SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY/" .env

echo "✅ .env file updated successfully!"

