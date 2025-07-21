# devtask

A modern task management application built with Next.js, TypeScript, and Effect.
Features drag-and-drop task organization, multiple user profiles, filtering, and
a clean, Linear-inspired design.

## ✨ Features

- **Task Management**: Create, edit, delete, and organize tasks with due dates and categories
- **Multiple Profiles**: Switch between different contexts (work, personal, etc.)
- **Drag & Drop**: Intuitive task organization with dnd-kit
- **Search & Filter**: Real-time search and filtering by status/category
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Interactive Onboarding**: New users get helpful tutorial tasks
- **Type Safety**: End-to-end TypeScript with Prisma

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + Headless UI
- **State**: TanStack Query
- **Effect**: Effect for clean error handling
- **Testing**: Vitest with integration tests

## 📋 Requirements

Before getting started, you'll need to install these tools:

### Install with Homebrew (macOS)

```bash
# Install Node.js (for pnpm)
brew install node

# Install pnpm package manager
brew install pnpm

# Install Docker Desktop
brew install --cask docker

# Install Supabase CLI
brew install supabase/tap/supabase
```

### Manual Installation

- **Docker Desktop**: [Download from docker.com](https://www.docker.com/products/docker-desktop/)
- **Supabase CLI**: [Installation guide](https://supabase.com/docs/guides/cli/getting-started)
- **pnpm**: `npm install -g pnpm`

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

Reset and seed your local database:

```bash
pnpm db:reset:local
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

Visit [http://localhost:3000](http://localhost:3000) and log in with:

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

Update `.env.test` with test database credentials (different port from main instance).

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:64321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-anon-key-from-supabase-start

SUPABASE_SERVICE_ROLE_KEY=replace-with-service_role-key-from-supabase-start
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:64322/postgres
```

### Running Migrations for Test Database

```
# Apply migrations to test database
pnpm test:db:migrate
```

### Running Tests

```bash
# Start the test server
pnpm test:server

# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with Vitest UI
pnpm test:ui
```

### Test Coverage

The test suite includes:

- ✅ API endpoint testing (CRUD operations)
- ✅ Authentication and authorization
- ✅ Cross-user security verification
- ✅ Database integrity
- ✅ Error handling scenarios

## 🏗 Architecture & Philosophy

### Effect

This project strategically uses [Effect](https://effect.website/) in specific
areas where it provides clear value:

**Why Effect?**

- **Cleaner Error Handling**: No more try/catch blocks or error-prone async code
- **Composable Operations**: Chain database operations, API calls, and transformations elegantly
- **Type-Safe Errors**: Errors are part of the type system, making them impossible to ignore
- **Functional Approach**: Immutable, predictable code that's easier to test and reason about

**Where We Use Effect:**

- **API Routes**: Clean request/response handling with automatic error mapping
- **Service Layer**: Database operations with composable error handling
- **Data Transformations**: Type-safe, composable pipelines for processing data

## 🎯 Project Structure

```
├── src/app/                # Next.js App Router pages
│   ├── api/                # API routes with Effect error handling
│   └── app/                # Main application UI
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
pnpm db:reset:local         # Reset local database and seed data

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
```

## Next Steps

There are a few features I would have liked to build that I didn't have time
for:

- CRUD operations for categories. Right now you just get "Creative", "Health",
  and "Shopping".
- CRUD operations for profiles. Right now you just get "Work" and "Personal".
- UI treatment for overdue or due soon tasks.
- e2e tests with Playwright.

## 📄 License

MIT License

---

Built with ❤️
