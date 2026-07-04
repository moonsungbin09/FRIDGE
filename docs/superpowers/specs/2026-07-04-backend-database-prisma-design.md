# Backend Database Integration Design (PostgreSQL + Prisma)

## Goal
Add a minimal, production-aligned database foundation to the existing backend using PostgreSQL and Prisma.

## Scope
- Use PostgreSQL as primary database.
- Initialize Prisma in `backend`.
- Configure `DATABASE_URL` via environment variable.
- Add and apply one initial migration.
- Add runtime database connection check during server startup.
- Exclude CRUD endpoints, authentication, and domain modeling beyond migration baseline.

## Architecture
- Database: PostgreSQL
- ORM/Client: Prisma + Prisma Client
- Schema source: `backend/prisma/schema.prisma`
- Runtime integration point: `backend/src/server.ts` startup sequence

The server should fail loudly when DB connection is unavailable rather than running in a partially healthy state.

## Components
- `backend/prisma/schema.prisma`: datasource, generator, and initial model/migration baseline.
- `backend/.env` (or environment): `DATABASE_URL`.
- `backend/src/lib/prisma.ts`: shared Prisma client instance.
- `backend/src/server.ts`: startup DB connectivity check before serving traffic.
- `backend/package.json`: scripts for Prisma generate/migrate flow.

## Data Flow
1. Developer sets `DATABASE_URL`.
2. `prisma migrate dev` creates/applies initial migration.
3. App startup creates Prisma client.
4. Server performs DB connectivity check.
5. On success, server begins listening; on failure, process exits with explicit error.

## Error Handling
- Invalid/missing `DATABASE_URL` should produce explicit startup failure.
- Database connection failure should be logged with clear context and terminate startup.
- No silent retries or fallback to in-memory behavior.

## Testing Strategy
- For this scaffolding phase, verify operational behavior:
  1. Prisma generation succeeds.
  2. Initial migration can be applied.
  3. Server startup succeeds when DB is reachable.
  4. Server startup fails loudly when DB is unreachable/misconfigured.

## Success Criteria
1. Prisma is installed and configured in `backend`.
2. Initial migration exists and is applicable.
3. Server startup includes DB connection validation.
4. Database misconfiguration surfaces explicit startup error.
