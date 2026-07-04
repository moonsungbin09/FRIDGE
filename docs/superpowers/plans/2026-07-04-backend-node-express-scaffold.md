# Backend Node Express Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a runnable `backend` service using Node.js, Express, and TypeScript with a working `GET /health` endpoint.

**Architecture:** Build a minimal single-entry backend in `src/server.ts` with Express app setup, one health route, and explicit server startup. Use TypeScript compilation to `dist` for production start while keeping development flow in watch mode. Keep scope intentionally narrow (no DB/auth/layered modules yet).

**Tech Stack:** Node.js, npm, Express, TypeScript, tsx

---

### Task 1: Initialize backend package and TypeScript config

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.gitignore`

- [ ] **Step 1: Create backend directory and initialize npm package**

```powershell
New-Item -ItemType Directory -Path backend -Force | Out-Null
cd backend; npm init -y
```

- [ ] **Step 2: Install runtime dependency**

```powershell
cd backend; npm install express
```

- [ ] **Step 3: Install development dependencies**

```powershell
cd backend; npm install -D typescript tsx @types/node @types/express
```

- [ ] **Step 4: Create TypeScript config**

`backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Update npm scripts**

`backend/package.json` scripts section:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

- [ ] **Step 6: Add backend gitignore**

`backend/.gitignore`

```gitignore
node_modules
dist
```

- [ ] **Step 7: Validate TypeScript build baseline**

Run:

```powershell
cd backend; npm run build
```

Expected:
- Command completes without TypeScript configuration errors (it may warn about missing source file before Task 2 if `src` doesn't exist yet; create `src` before rerun if needed).

- [ ] **Step 8: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/tsconfig.json backend/.gitignore
git commit -m "chore: initialize backend node express typescript scaffold"
```

### Task 2: Implement minimal server and health endpoint

**Files:**
- Create: `backend/src/server.ts`

- [ ] **Step 1: Create server implementation**

`backend/src/server.ts`

```ts
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
```

- [ ] **Step 2: Build to verify TypeScript compiles**

Run:

```powershell
cd backend; npm run build
```

Expected:
- PASS with generated `dist/server.js`

- [ ] **Step 3: Run server in development mode**

Run:

```powershell
cd backend; npm run dev
```

Expected:
- Output includes `Backend server listening on port 4000`

- [ ] **Step 4: Verify health endpoint response**

In another terminal:

```powershell
curl http://127.0.0.1:4000/health
```

Expected:

```json
{"status":"ok"}
```

- [ ] **Step 5: Stop server**

```powershell
# Stop with Ctrl+C in the server terminal.
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/server.ts
git commit -m "feat: add express server with health endpoint"
```

### Task 3: Final runtime validation

**Files:**
- Modify: none (validation only)

- [ ] **Step 1: Build production output**

```powershell
cd backend; npm run build
```

Expected:
- `dist/server.js` is generated/updated.

- [ ] **Step 2: Run production start script**

```powershell
cd backend; npm start
```

Expected:
- Output includes `Backend server listening on port 4000`

- [ ] **Step 3: Verify health endpoint in production mode**

In another terminal:

```powershell
curl http://127.0.0.1:4000/health
```

Expected:

```json
{"status":"ok"}
```

- [ ] **Step 4: Stop production server and confirm clean tree**

```bash
git status
```

Expected:
- No unintended tracked file changes beyond planned scaffold artifacts.
