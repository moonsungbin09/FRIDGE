# Backend Database (PostgreSQL + Prisma) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate PostgreSQL and Prisma into the existing backend with initial migration and startup DB connectivity validation.

**Architecture:** Keep the server structure minimal by adding a shared Prisma client module and a startup connection check before the HTTP server begins handling requests. Store schema and migrations under `backend/prisma`, with runtime configuration via `DATABASE_URL`. Fail startup explicitly if database configuration or connectivity is invalid.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM

---

### Task 1: Install and initialize Prisma for backend

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/.env`

- [ ] **Step 1: Install Prisma dependencies**

```powershell
cd backend; npm install @prisma/client && npm install -D prisma
```

- [ ] **Step 2: Initialize Prisma baseline**

```powershell
cd backend; npx prisma init --datasource-provider postgresql
```

Expected:
- `backend/prisma/schema.prisma` exists
- `.env` contains `DATABASE_URL`

- [ ] **Step 3: Update npm scripts for Prisma workflow**

Set scripts in `backend/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

- [ ] **Step 4: Set local PostgreSQL connection string**

Update `backend/.env`:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fridge_app?schema=public"
```

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/prisma/schema.prisma backend/.env
git commit -m "chore: initialize prisma with postgresql datasource"
```

### Task 2: Create and apply initial migration

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/*/migration.sql`

- [ ] **Step 1: Define initial schema model**

Set `backend/prisma/schema.prisma` content to:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AppHealth {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Generate and apply first migration**

```powershell
cd backend; npx prisma migrate dev --name init
```

Expected:
- migration directory created under `backend/prisma/migrations`
- PostgreSQL schema updated

- [ ] **Step 3: Generate Prisma client**

```powershell
cd backend; npx prisma generate
```

Expected:
- Prisma Client generated successfully

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add initial prisma migration"
```

### Task 3: Add runtime DB connection check on server startup

**Files:**
- Create: `backend/src/lib/prisma.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Add shared Prisma client module**

Create `backend/src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

- [ ] **Step 2: Add startup DB connection validation**

Update `backend/src/server.ts` to:

```ts
import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port =
  Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535
    ? parsedPort
    : 4000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await prisma.$disconnect();
    server.close((closeError) => {
      if (closeError) {
        console.error("Error during server shutdown:", closeError);
        process.exit(1);
      }
      console.log("Server stopped");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

void startServer();
```

- [ ] **Step 3: Validate compile succeeds**

```powershell
cd backend; npm run build
```

Expected:
- `tsc -p tsconfig.json` passes without type errors

- [ ] **Step 4: Validate runtime success path**

```powershell
cd backend; npm run dev
```

Expected output includes:
- `Database connection established`
- `Server running on port 4000`

Then in another terminal:

```powershell
curl http://127.0.0.1:4000/health
```

Expected:

```json
{"status":"ok"}
```

- [ ] **Step 5: Validate runtime failure path**

Temporarily set invalid `DATABASE_URL` in `backend/.env`, then run:

```powershell
cd backend; npm run dev
```

Expected:
- startup exits with `Database connection failed:` log
- no server listening output

Restore valid `DATABASE_URL` after check.

- [ ] **Step 6: Commit**

```bash
git add backend/src/lib/prisma.ts backend/src/server.ts
git commit -m "feat: add prisma startup connectivity check"
```
