# devtask

## Getting Started

### 1. Set up environment variables

```sh
cp .env.local.example .env
```

Replace the placeholder values in `.env` with your actual Supabase project credentials. You'll see these when you run `supabase start`.

---

### 2. Reset and seed your local Supabase database

This will stop any running Supabase instance, wipe all local data, restart it, apply Prisma migrations, and seed initial data:

```sh
pnpm db:reset:local
```

---

### 3. Start the development server

```sh
pnpm dev
```
