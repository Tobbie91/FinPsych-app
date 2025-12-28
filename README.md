# Fintech Credit Application

A production-ready monorepo boilerplate for a fintech credit application.

## Monorepo Structure

```
/apps
  /applicant       # Borrower interface (port 3000)
  /institution     # Bank / financial institution (port 3001)
  /admin           # System admin / owner (port 3002)

/packages
  /ui              # Shared UI components (placeholders)
  /hooks           # Shared React hooks
  /lib             # Supabase client, auth helpers
  /types           # Shared TypeScript types
  /config          # Environment & app configuration

/supabase
  /migrations      # SQL migration files
  /seed            # Seed data for development
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript (strict), Tailwind CSS
- **State Management**: TanStack Query, Zustand
- **Backend**: Supabase (Auth + Postgres)
- **Monorepo**: pnpm workspaces, Turborepo
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Supabase account (or local Supabase instance)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fintech-credit-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` with Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_APPLICANT_URL=http://localhost:3000
   NEXT_PUBLIC_INSTITUTION_URL=http://localhost:3001
   NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
   ```

5. Run database migrations in Supabase Dashboard or using Supabase CLI.

### Running Locally

Run individual apps:
```bash
pnpm dev:applicant    # http://localhost:3000
pnpm dev:institution  # http://localhost:3001
pnpm dev:admin        # http://localhost:3002
```

Build all apps:
```bash
pnpm build
```

Lint and format:
```bash
pnpm lint
pnpm format
```

## Authentication & Roles

### User Roles

The system supports three user roles:

| Role | Description | App |
|------|-------------|-----|
| `applicant` | Borrowers applying for credit | applicant (port 3000) |
| `institution` | Banks and financial institutions | institution (port 3001) |
| `admin` | System administrators | admin (port 3002) |

### How Roles Work

1. **Role Storage**: Roles are stored in Supabase `user_metadata` during signup.

2. **Role Assignment**: When a user signs up through an app, they receive that app's role:
   - Signing up on `/signup` in the applicant app → `applicant` role
   - Signing up on `/signup` in the institution app → `institution` role
   - Signing up on `/signup` in the admin app → `admin` role

3. **Route Protection**: Each app's protected routes check for the correct role:
   ```typescript
   // In the protected layout
   const { isAuthorized } = useProtectedRoute({
     requiredRole: 'applicant', // or 'institution', 'admin'
   });
   ```

4. **Cross-App Redirects**: If a user with the wrong role tries to access an app, they are automatically redirected to the correct app based on their role.

### Auth Flow

```
User visits /dashboard
        ↓
  Is authenticated?
    ↓ No          ↓ Yes
Redirect to    Has correct role?
  /login         ↓ No          ↓ Yes
              Redirect to    Show dashboard
              correct app
```

### Shared Auth Utilities

Located in `@fintech/lib`:

- `signUp()` - Register new user with role
- `signIn()` - Sign in existing user
- `signOut()` - Sign out user
- `getCurrentUser()` - Get current authenticated user
- `getRedirectUrlForUser()` - Get app URL for user's role
- `hasRequiredRole()` - Check if user has required role

### Shared Hooks

Located in `@fintech/hooks`:

- `useAuth()` - Auth operations (login, register, logout)
- `useUser()` - Current user data with caching
- `useProtectedRoute()` - Route protection with role checking

## Supabase Setup

### Database Schema

The migrations create the following tables:

| Table | Description |
|-------|-------------|
| `users` | Extends auth.users with role |
| `applicant_profiles` | Borrower profile data |
| `institutions` | Financial institution data |
| `institution_users` | Institution membership junction |
| `credit_scores` | Credit score records |

### Row Level Security

All tables have RLS policies:

- Users can only read/update their own data
- Institutions can read applicant data
- Admins have full read access

### Running Migrations

Using Supabase CLI:
```bash
supabase db push
```

Or apply migrations manually in the Supabase Dashboard SQL editor.

## Packages

### @fintech/types

Shared TypeScript types:
- `Role` - User role union type
- `User` - User entity
- `ApplicantProfile` - Applicant profile (placeholder)
- `Institution` - Institution entity (placeholder)
- `CreditScore` - Credit score record (placeholder)

### @fintech/config

Environment configuration with Zod validation:
- `getEnv()` - Validated environment variables
- `getAppUrlForRole()` - App URL for role
- `APP_CONFIG` - Application constants

### @fintech/lib

Supabase clients and auth helpers:
- Browser client for client components
- Server client for server components
- Middleware client for session refresh
- Auth helper functions

### @fintech/hooks

Shared React hooks:
- `useAuth()` - Authentication operations
- `useUser()` - User data with TanStack Query
- `useProtectedRoute()` - Route protection
- `useAppStore()` - Zustand store

### @fintech/ui

Placeholder UI components:
- `Button`
- `Input`
- `Card`
- `Spinner`

Implement styling based on your design system.

## Development

### Adding a New Package

1. Create directory in `/packages`:
   ```bash
   mkdir -p packages/new-package/src
   ```

2. Add `package.json`:
   ```json
   {
     "name": "@fintech/new-package",
     "version": "0.0.1",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```

3. Add to apps that need it:
   ```json
   {
     "dependencies": {
       "@fintech/new-package": "workspace:*"
     }
   }
   ```

### Adding a New App

1. Copy an existing app directory
2. Update `package.json` name and port
3. Update `next.config.ts` if needed
4. Update protected layout `requiredRole`

## License

MIT
