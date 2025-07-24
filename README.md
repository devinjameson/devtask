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

- Node
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

Make sure Docker Desktop is running, then:

```bash
supabase start
```

### 3. Environment Configuration

```bash
pnpm env:setup
```

This will automatically copy `.env.example` to `.env` and populate it with your
Supabase credentials.

If the automated setup fails, you can manually copy and configure:

```bash
cp .env.example .env
supabase status  # Shows your credentials
# Copy the anon key and service_role key into .env
```

### 4. Database Setup

Migrate and seed your local development database:

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). Create a new account or
log in with:

```text
Email: demo@example.com
Password: password123
```

## 🧪 Testing

The app includes integration tests that verify API endpoints, security, and
database operations.

### Test Database Setup

First, make sure Docker Desktop is running, then start up a separate Supabase
instance for testing.

```bash
# Start test Supabase instance
pnpm test:supabase
```

### Environment Configuration for Tests

```bash
pnpm env:setup:test
```

This will automatically copy `.env.test.example` to `.env.test` and populate it
with your test Supabase credentials.

If the automated setup fails, you can manually copy and configure:

```bash
cp .env.test.example .env.test
supabase status --workdir supabase-test  # Shows your test credentials
# Copy the anon key and service_role key into .env.test
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
making impossible states unrepresentable. We use these patterns sparingly where
they make the code more clear and maintainable.

**AsyncResult** handles async operations with three explicit states:

- `Loading` - Operation in progress
- `Ok(value)` - Success with data
- `Err(error)` - Failure with error details

**Option** (from Effect) explicitly handles potentially absent values:

- `Some(value)` - Value exists
- `None` - Value is absent

#### Example: Session Management

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

```text
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
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:reset               # Reset development database and seed data

# Environment Setup
pnpm env:setup              # Setup .env with Supabase credentials
pnpm env:setup:test         # Setup .env.test with test Supabase credentials

# Code Quality
pnpm lint                   # Run ESLint
pnpm typecheck              # Run TypeScript checks
pnpm format                 # Format code with Prettier
pnpm format:md              # Format README with markdownlint
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
- Implement optimistic updates for task creation. I tried but ran into issues
  with UI jank.
- Dark mode.

## 📄 License

MIT License

---

Built with ❤️
