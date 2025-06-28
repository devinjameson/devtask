## Getting Started

Install and start PostgreSQL locally:

```sh
brew install postgresql@15
brew services start postgresql@15
createdb devtask
```

Set up environment variables:

```sh
cp .env.example .env
```

Push the Prisma schema and seed the database:

```sh
pnpm prisma db push
pnpm prisma db seed
```

Start the development server:

```sh
pnpm dev
```
