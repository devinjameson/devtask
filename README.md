# devtask

## Requirements

- Homebrew
- Docker Desktop
- Supabase

## Getting Started

### Install packages

```sh
pnpm install
```

---

### Start supabase

```sh
supabase start
```

Supabase will provide your project credentials when it finishes starting up.
Keep these areound for the next step

---

### Set up environment variables

```sh
cp .env.local.example .env
```

Replace the placeholder values in `.env` with your actual Supabase project credentials.
You'll see these when Supabase finishes starting up.

---

### Reset and seed your local Supabase database

This will stop any running Supabase instance, wipe all local data, restart Supabase,
apply Prisma migrations, and seed initial data.

If this fails, you can safely run it again.

```sh
pnpm db:reset:local
```

---

### Start the development server

```sh
pnpm dev
```

You can log in with the demo user credentials:

```
demo@example.com
password123
```
