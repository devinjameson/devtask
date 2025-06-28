## Getting Started

Set up environment variables:

```sh
cp .env.example .env
```

In `.env`, replace `<DB_PASSWORD>` with your actual Supabase database password.

The `SUPABASE_SERVICE_ROLE_KEY` is optional and should only be set on the server.

Push the Prisma schema and seed the Supabase database:

```sh
pnpm prisma db push
pnpm prisma db seed
```

Start the development server:

```sh
pnpm dev
```
