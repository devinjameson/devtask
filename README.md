# devtask

A modern task management application built with Next.js, TypeScript, and Effect.
Features drag-and-drop task organization, multiple user profiles, filtering, and
a clean, Linear-inspired design.

## 🚀 Live App

[www.devtask.dev](https://www.devtask.dev)

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + Headless UI
- **State**: TanStack Query
- **Effect**: Typed errors, composability
- **Testing**: Vitest for route handler integration tests

## 📋 Requirements

Before getting started, you'll need to install these tools.

### Prerequisites

- Node (current LTS version recommended)
- pnpm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

#### Install with Homebrew (recommended)

```bash
brew install pnpm
brew install --cask docker
brew install supabase/tap/supabase
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Supabase

```bash
supabase start
```

Supabase will provide your project credentials when it finishes starting up. Keep these for the next step.

### 3. Environment Configuration

```bash
cp .env.example .env
```

Replace the placeholder values in `.env` with your actual Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-anon-key-from-supabase-start

SUPABASE_SERVICE_ROLE_KEY=replace-with-service_role-key-from-supabase-start
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 4. Database Setup

Reset and seed your local development database:

```bash
pnpm db:reset
```

This command will:

- Stop any running Supabase instance
- Wipe all local data
- Restart Supabase
- Apply Prisma migrations
- Seed initial demo data

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). Create a new account or log in with:

```
Email: demo@example.com
Password: password123
```

## 🧪 Testing

The app includes integration tests that verify API endpoints, security, and database operations.

### Test Database Setup

First, set up a separate Supabase instance for testing.

Supabase will provide your project credentials when it finishes starting up. Keep these for the next step.

```bash
# Start test Supabase instance
pnpm test:supabase
```

### Environment Configuration for Tests

```bash
cp .env.test.example .env.test
```

Update `.env.test` with the test database credentials from Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:64321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-anon-key-from-supabase-start

SUPABASE_SERVICE_ROLE_KEY=replace-with-service_role-key-from-supabase-start
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:64322/postgres
```

### Running Migrations for Test Database

```bash
# Apply migrations to test database
pnpm test:db:migrate
```

### Running Tests

```bash
# Start test Supabase instance (if it's not already running)
pnpm test:supabase

# Start test server
pnpm test:server

# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with Vitest UI
pnpm test:ui
```

## 🏗 Architecture & Philosophy

### Effect

This project uses [Effect](https://effect.website/) strategically in API route
handlers for error handling and service composition. Each route handler follows
a consistent pattern:

1. Composes service layer Effects using Effect gen syntax
1. Transforms errors into a unified format
1. Converts the Effect into a NextResponse

This approach eliminates try-catch blocks, provides type-safe error handling,
and ensures consistent API responses across all endpoints.

### State Modeling with AsyncResult and Option

This project uses custom AsyncResult and Effect's Option types to explicitly
model all possible states in the UI layer. This pattern prevents common bugs by
making impossible states unrepresentable.

**AsyncResult** handles async operations with three explicit states:

- `Loading` - Operation in progress
- `Ok(value)` - Success with data
- `Err(error)` - Failure with error details

**Option** (from Effect) explicitly handles potentially absent values:

- `Some(value)` - Value exists
- `None` - Value is absent

**Example: Session Management**

```tsx
// Instead of: Session | null | undefined
// We use: AsyncResult<Option<Session>>

AsyncResult.match(sessionState, {
  onLoading: () => <Spinner />,
  onErr: (error) => <ErrorMessage error={error} />,
  onOk: (maybeSession) =>
    Option.match(maybeSession, {
      onNone: () => <LoginPrompt />,
      onSome: (session) => <AuthenticatedApp session={session} />,
    }),
})
```

This pattern makes managing asynchronous data and optional values easier
to reason about and less error-prone.

## 🎯 Project Structure

```
├── src/app/                # Next.js App Router pages
│   ├── api/                # Route Handlers
│   └── app/                # Application UI
├── core/                   # Shared business logic
│   ├── api/service/        # Effect-based service layer
│   ├── lib/                # Utility functions
│   └── prisma/             # Database client
├── prisma/                 # Database schema and migrations
├── test/                   # Integration test suite
└── src/ui/                 # Reusable UI components
```

## 📝 Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:reset               # Reset development database and seed data

# Code Quality
pnpm lint                   # Run ESLint
pnpm typecheck              # Run TypeScript checks
pnpm format                 # Format code with Prettier
pnpm prep                   # Run format, typecheck, and lint

# Testing
pnpm test                   # Run tests in watch mode
pnpm test:run               # Run tests once
pnpm test:ui                # Run tests with Vitest UI
pnpm test:server            # Start test server on port 3001
pnpm test:supabase          # Start test Supabase instance
pnpm test:supabase:stop     # Stop test Supabase instance
pnpm test:supabase:status   # Check test Supabase status
pnpm test:start             # Start test Supabase and server together
pnpm test:db:push           # Push schema to test database
pnpm test:db:migrate        # Apply migrations to test database
pnpm test:db:reset          # Reset test database

# Production
pnpm prod:prisma:migrate    # Run migrations on production database
```

## Next Steps

There are a few features I would have liked to build that I didn't have time
for:

- CRUD operations for categories. Right now you just get "Creative", "Health",
  and "Shopping".
- CRUD operations for profiles. Right now you just get "Work" and "Personal".
- UI treatment for overdue or due soon tasks.
- e2e tests with Playwright.
- Keyboard interaction support for drag-and-drop.
- Investigate using localStorage to store the active profile id vs. cookies. Or
  perhaps managing the local state with TanStack Query instead of nanostores.
- Handle edge cases with task sorting, such as reordering tasks in a smarter way
  while filtering, mostly for moves to the top of the list.
- Implement proper race condition handling for drag-and-drop on slow network
  connections. Currently, rapid drag operations can cause UI inconsistencies.
- Enable filtering by mulitple task stasuses and categories at once.
- Improve API route payload validation with Effect Schema.

## 📄 License

MIT License

---

Built with ❤️
