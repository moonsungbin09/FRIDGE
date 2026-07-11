# Fridge App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a login-free fridge app where users save ingredients in the browser, get recipe matches from predefined data, and open AI-written recipe explanations through Azure OpenAI.

**Architecture:** React owns the UI and ingredient state. Ingredients persist in `localStorage`, recipe suggestions come from a local match table, and a small Express API handles Azure OpenAI calls so the key never reaches the browser. For deployment, the frontend build will be served by the backend so Azure CLI can publish one web app.

**Tech Stack:** React 19, Vite, TypeScript, Express 5, Azure OpenAI, Azure CLI, `localStorage`, Vitest, Node test runner

---

### Task 1: Building ingredient storage and the app shell

**Files:**
- Create: `frontend/src/types.ts`
- Create: `frontend/src/lib/ingredientStorage.ts`
- Create: `frontend/src/lib/ingredientStorage.test.ts`
- Create: `frontend/src/components/HomeScreen.tsx`
- Create: `frontend/src/components/IngredientManager.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/index.css`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing test**

`frontend/src/lib/ingredientStorage.test.ts`
```ts
import { describe, expect, it } from "vitest";
import {
  addIngredient,
  getStoredIngredients,
  removeIngredient,
} from "./ingredientStorage";

describe("ingredientStorage", () => {
  it("normalizes whitespace and ignores duplicates", () => {
    const start = ["두부"];
    const next = addIngredient(start, "  김치  ");
    expect(next).toEqual(["두부", "김치"]);
    expect(addIngredient(next, "김치")).toEqual(["두부", "김치"]);
  });

  it("removes an ingredient by normalized name", () => {
    expect(removeIngredient(["두부", "김치"], " 김치 ")).toEqual(["두부"]);
  });

  it("reads an empty list when storage is missing", () => {
    expect(getStoredIngredients(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```powershell
cd frontend
npm run test -- src/lib/ingredientStorage.test.ts
```
Expected: FAIL because `vitest` and the helper functions do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

`frontend/src/types.ts`
```ts
export type Ingredient = string;
```

`frontend/src/lib/ingredientStorage.ts`
```ts
const STORAGE_KEY = "fridge-app.ingredients";

export const normalizeIngredient = (value: string) => value.trim().replace(/\s+/g, " ");

export const addIngredient = (items: string[], value: string) => {
  const next = normalizeIngredient(value);
  if (!next) return items;
  if (items.some((item) => item === next)) return items;
  return [...items, next];
};

export const removeIngredient = (items: string[], value: string) => {
  const target = normalizeIngredient(value);
  return items.filter((item) => item !== target);
};

export const getStoredIngredients = (storage: Storage | null) => {
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const setStoredIngredients = (storage: Storage | null, items: string[]) => {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(items));
};
```

`frontend/src/components/HomeScreen.tsx`
```tsx
type HomeScreenProps = {
  onOpenIngredients: () => void;
  onOpenRecipes: () => void;
};

export function HomeScreen({ onOpenIngredients, onOpenRecipes }: HomeScreenProps) {
  return (
    <section className="home">
      <h1>냉장고 앱</h1>
      <p>재료를 저장하고, 만들 수 있는 음식을 추천받아보세요.</p>
      <div className="home-actions">
        <button type="button" onClick={onOpenIngredients}>재료 추가 / 삭제</button>
        <button type="button" onClick={onOpenRecipes}>레시피 추천</button>
      </div>
    </section>
  );
}
```

`frontend/src/components/IngredientManager.tsx`
```tsx
type IngredientManagerProps = {
  ingredients: string[];
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
};

export function IngredientManager(props: IngredientManagerProps) {
  return (
    <section className="ingredients">
      <input value={props.value} onChange={(event) => props.onChange(event.target.value)} />
      <button type="button" onClick={props.onAdd}>추가</button>
      <ul>
        {props.ingredients.map((item) => (
          <li key={item}>
            <span>{item}</span>
            <button type="button" onClick={() => props.onRemove(item)}>삭제</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`frontend/src/App.tsx`
```tsx
import { useEffect, useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { IngredientManager } from "./components/IngredientManager";
import { addIngredient, getStoredIngredients, removeIngredient, setStoredIngredients } from "./lib/ingredientStorage";

type View = "home" | "ingredients" | "recipes";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setIngredients(getStoredIngredients(window.localStorage));
  }, []);

  useEffect(() => {
    setStoredIngredients(window.localStorage, ingredients);
  }, [ingredients]);

  if (view === "home") {
    return <HomeScreen onOpenIngredients={() => setView("ingredients")} onOpenRecipes={() => setView("recipes")} />;
  }

  if (view === "ingredients") {
    return (
      <IngredientManager
      ingredients={ingredients}
      value={draft}
      onChange={setDraft}
      onAdd={() => {
        setIngredients((current) => addIngredient(current, draft));
        setDraft("");
      }}
      onRemove={(name) => setIngredients((current) => removeIngredient(current, name))}
      />
    );
  }

  return <p>레시피 화면은 Task 2에서 연결합니다.</p>;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```powershell
cd frontend
npm run test -- src/lib/ingredientStorage.test.ts
npm run build
```
Expected: tests pass and Vite build succeeds.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/types.ts frontend/src/lib/ingredientStorage.ts frontend/src/lib/ingredientStorage.test.ts frontend/src/components/HomeScreen.tsx frontend/src/components/IngredientManager.tsx frontend/src/App.tsx frontend/src/App.css frontend/src/index.css frontend/package.json
git commit -m "feat: add fridge ingredient shell"
```

### Task 2: Implementing the recipe matching engine and suggestion UI

**Files:**
- Create: `frontend/src/data/recipeMatches.ts`
- Create: `frontend/src/lib/recipeMatcher.ts`
- Create: `frontend/src/lib/recipeMatcher.test.ts`
- Create: `frontend/src/components/RecipeSuggestions.tsx`
- Create: `frontend/src/components/RecipeDetail.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write the failing test**

`frontend/src/lib/recipeMatcher.test.ts`
```ts
import { describe, expect, it } from "vitest";
import { findRecipeMatches } from "./recipeMatcher";

describe("findRecipeMatches", () => {
  it("returns tomato pasta and shows noodles as missing", () => {
    const matches = findRecipeMatches(["토마토", "치즈"]);
    expect(matches[0].name).toBe("토마토 파스타");
    expect(matches[0].missingIngredients).toContain("면");
  });

  it("returns kimchi stew when tofu and kimchi are present", () => {
    const matches = findRecipeMatches(["두부", "김치"]);
    expect(matches.some((item) => item.name === "김치찌개")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```powershell
cd frontend
npm run test -- src/lib/recipeMatcher.test.ts
```
Expected: FAIL because the matching table and matcher do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

`frontend/src/data/recipeMatches.ts`
```ts
export type RecipeMatch = {
  id: string;
  name: string;
  coreIngredients: string[];
  missingIngredients: string[];
  referenceNotes: string[];
};

export const recipeMatches = [
  {
    id: "kimchi-stew",
    name: "김치찌개",
    coreIngredients: ["김치", "두부"],
    missingIngredients: ["돼지고기", "대파", "마늘"],
    referenceNotes: ["공개 레시피에서 흔히 쓰는 기본 재료만 짧게 정리"],
  },
  {
    id: "tomato-pasta",
    name: "토마토 파스타",
    coreIngredients: ["토마토", "치즈"],
    missingIngredients: ["면", "올리브오일", "마늘"],
    referenceNotes: ["공개 레시피를 바탕으로 짧은 설명만 제공"],
  },
];
```

`frontend/src/lib/recipeMatcher.ts`
```ts
import { recipeMatches, type RecipeMatch } from "../data/recipeMatches";

export const findRecipeMatches = (ingredients: string[]): RecipeMatch[] => {
  const normalized = ingredients.map((item) => item.trim());
  return recipeMatches
    .filter((recipe) => recipe.coreIngredients.every((item) => normalized.includes(item)))
    .map((recipe) => ({
      ...recipe,
      missingIngredients: recipe.missingIngredients.filter((item) => !normalized.includes(item)),
    }));
};
```

`frontend/src/components/RecipeSuggestions.tsx`
```tsx
type RecipeSuggestionsProps = {
  matches: { id: string; name: string; missingIngredients: string[] }[];
  onSelect: (recipeName: string) => void;
};

export function RecipeSuggestions({ matches, onSelect }: RecipeSuggestionsProps) {
  return (
    <section className="recipes">
      <ul>
        {matches.map((recipe) => (
          <li key={recipe.id}>
            <button type="button" onClick={() => onSelect(recipe.name)}>
              {recipe.name}
            </button>
            <p>부족 재료: {recipe.missingIngredients.join(", ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`frontend/src/components/RecipeDetail.tsx`
```tsx
type RecipeDetailProps = {
  recipeName: string;
  summary: string;
  loading: boolean;
  error: string | null;
};

export function RecipeDetail(props: RecipeDetailProps) {
  if (props.loading) return <p>레시피를 불러오는 중입니다.</p>;
  if (props.error) return <p>{props.error}</p>;

  return (
    <section className="recipe-detail">
      <h2>{props.recipeName}</h2>
      <p>{props.summary}</p>
    </section>
  );
}
```

`frontend/src/App.tsx`
```tsx
// Add recipe view state, call findRecipeMatches(ingredients), and pass the selected dish to RecipeDetail.
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```powershell
cd frontend
npm run test -- src/lib/recipeMatcher.test.ts
npm run build
```
Expected: tests pass and the frontend still builds.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/data/recipeMatches.ts frontend/src/lib/recipeMatcher.ts frontend/src/lib/recipeMatcher.test.ts frontend/src/components/RecipeSuggestions.tsx frontend/src/components/RecipeDetail.tsx frontend/src/App.tsx
git commit -m "feat: add recipe matching"
```

### Task 3: Adding the Azure OpenAI recipe summary API

**Files:**
- Create: `backend/src/config/env.ts`
- Create: `backend/src/services/azureOpenAi.ts`
- Create: `backend/src/services/recipePrompt.ts`
- Create: `backend/src/routes/recipes.ts`
- Create: `backend/test/recipePrompt.test.ts`
- Create: `backend/.env.example`
- Modify: `backend/src/server.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Write the failing test**

`backend/test/recipePrompt.test.ts`
```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildRecipePrompt } from "../src/services/recipePrompt";

test("buildRecipePrompt includes recipe name, ingredients, and missing ingredients", () => {
  const prompt = buildRecipePrompt({
    recipeName: "토마토 파스타",
    ingredients: ["토마토", "치즈"],
    missingIngredients: ["면"],
  });

  assert.match(prompt, /토마토 파스타/);
  assert.match(prompt, /토마토/);
  assert.match(prompt, /면/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```powershell
cd backend
npm run test
```
Expected: FAIL because `buildRecipePrompt` and the test script do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

`backend/src/config/env.ts`
```ts
export const env = {
  azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? "",
  azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
  azureOpenAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "",
  azureOpenAiApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-02-15-preview",
};
```

`backend/src/services/recipePrompt.ts`
```ts
type RecipePromptInput = {
  recipeName: string;
  ingredients: string[];
  missingIngredients: string[];
};

export const buildRecipePrompt = ({ recipeName, ingredients, missingIngredients }: RecipePromptInput) =>
  [
    "너는 요리 설명을 아주 짧고 쉽게 정리하는 한국어 어시스턴트다.",
    `요리 이름: ${recipeName}`,
    `현재 가진 재료: ${ingredients.join(", ")}`,
    `부족한 재료: ${missingIngredients.join(", ")}`,
    "공개 레시피를 참고한 것처럼 자연스럽게 4~6문장으로 요약해라.",
    "재료 손질, 조리 순서, 마무리 팁을 간단히 포함해라.",
  ].join("\n");
```

`backend/src/services/azureOpenAi.ts`
```ts
import { env } from "../config/env";

export const createRecipeSummary = async (prompt: string) => {
  const response = await fetch(
    `${env.azureOpenAiEndpoint}/openai/deployments/${env.azureOpenAiDeployment}/chat/completions?api-version=${env.azureOpenAiApiVersion}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.azureOpenAiApiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "짧고 쉬운 한국어 레시피 설명만 작성해라." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Azure OpenAI request failed with ${response.status}`);
  }

  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message.content ?? "";
};
```

`backend/src/routes/recipes.ts`
```ts
import { Router } from "express";
import { buildRecipePrompt } from "../services/recipePrompt";
import { createRecipeSummary } from "../services/azureOpenAi";

export const recipesRouter = Router();

recipesRouter.post("/summary", async (req, res, next) => {
  try {
    const { recipeName, ingredients, missingIngredients } = req.body as {
      recipeName: string;
      ingredients: string[];
      missingIngredients: string[];
    };

    const prompt = buildRecipePrompt({ recipeName, ingredients, missingIngredients });
    const summary = await createRecipeSummary(prompt);

    res.json({ summary });
  } catch (error) {
    next(error);
  }
});
```

`backend/src/server.ts`
```ts
import express from "express";
import path from "node:path";
import { prisma } from "./lib/prisma";
import { recipesRouter } from "./routes/recipes";

const app = express();
app.use(express.json());
app.use("/api/recipes", recipesRouter);

const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});
```

`backend/.env.example`
```env
AZURE_OPENAI_ENDPOINT=https://fridge-openai.openai.azure.com
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=fridge-gpt4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
PORT=4000
```

`backend/package.json`
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "test": "node --import tsx --test"
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```powershell
cd backend
npm run test
npm run build
```
Expected: prompt test passes and backend compiles.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/config/env.ts backend/src/services/azureOpenAi.ts backend/src/services/recipePrompt.ts backend/src/routes/recipes.ts backend/test/recipePrompt.test.ts backend/.env.example backend/src/server.ts backend/package.json
git commit -m "feat: add azure openai recipe api"
```

### Task 4: Serving the frontend from the backend and wiring Azure CLI deployment

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package.json`
- Modify: `backend/src/server.ts`
- Modify: `backend/package.json`
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Write the failing smoke check**

Use this local smoke script after the frontend build has been copied into `backend/public`:
```powershell
cd backend
npm run start
curl http://localhost:4000/health
curl -Method Post http://localhost:4000/api/recipes/summary -ContentType "application/json" -Body '{"recipeName":"토마토 파스타","ingredients":["토마토","치즈"],"missingIngredients":["면"]}'
```
Expected: `/health` returns `{"status":"ok"}` and the recipe endpoint returns JSON.

- [ ] **Step 2: Run the smoke check to verify it fails before wiring**

Run:
```powershell
cd backend
npm run start
```
Expected: static files are not served yet or the route is incomplete.

- [ ] **Step 3: Write the minimal production-serving implementation**

`frontend/vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../backend/public"),
    emptyOutDir: true,
  },
});
```

`backend/src/server.ts`
```ts
import express from "express";
import path from "node:path";
import { recipesRouter } from "./routes/recipes";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());
app.use("/api/recipes", recipesRouter);

const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
```

`backend/package.json`
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

Azure CLI deployment commands:
```powershell
az group create --name fridge-app-rg --location koreacentral
az cognitiveservices account create --name fridge-openai --resource-group fridge-app-rg --location koreacentral --kind OpenAI --sku S0
az appservice plan create --name fridge-app-plan --resource-group fridge-app-rg --is-linux --sku B1
az webapp create --name fridgeapp-korea-01 --resource-group fridge-app-rg --plan fridge-app-plan --runtime "NODE|22-lts"
$endpoint = az cognitiveservices account show --name fridge-openai --resource-group fridge-app-rg --query properties.endpoint -o tsv
$apiKey = az cognitiveservices account keys list --name fridge-openai --resource-group fridge-app-rg --query key1 -o tsv
az webapp config appsettings set --resource-group fridge-app-rg --name fridgeapp-korea-01 --settings NODE_ENV=production PORT=8080 AZURE_OPENAI_ENDPOINT=$endpoint AZURE_OPENAI_API_KEY=$apiKey AZURE_OPENAI_DEPLOYMENT=fridge-gpt4o AZURE_OPENAI_API_VERSION=2024-02-15-preview
cd frontend
npm run build
cd ..
Compress-Archive -Path backend\dist, backend\public, backend\package.json, backend\package-lock.json -DestinationPath fridge-app.zip -Force
az webapp deployment source config-zip --resource-group fridge-app-rg --name fridgeapp-korea-01 --src fridge-app.zip
```

- [ ] **Step 4: Run the smoke check to verify it passes**

Run:
```powershell
cd frontend
npm run build
cd ..\backend
npm run build
npm run start
```
Then verify `http://localhost:4000/` loads the frontend and `http://localhost:4000/health` returns JSON.

- [ ] **Step 5: Commit**

```powershell
git add frontend/vite.config.ts frontend/package.json backend/src/server.ts backend/package.json backend/src/routes/recipes.ts
git commit -m "feat: serve fridge app from backend"
```

### Task 5: Final validation and cleanup

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/index.css`
- Modify: `backend/src/server.ts`
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Run the full validation set**

Run:
```powershell
cd frontend
npm run test
npm run build
cd ..\backend
npm run test
npm run build
```
Expected: all tests and builds pass.

- [ ] **Step 2: Run the app end-to-end locally**

Run:
```powershell
cd backend
npm run start
```
Then confirm these flows:
1. Add `두부` and `김치`.
2. Open recipe recommendation.
3. See `김치찌개` and the missing ingredients list.
4. Open the recipe detail panel and confirm the Azure OpenAI summary renders.

- [ ] **Step 3: Deploy with Azure CLI and verify the live site**

Run:
```powershell
az webapp deployment source config-zip --resource-group fridge-app-rg --name fridgeapp-korea-01 --src fridge-app.zip
az webapp browse --resource-group fridge-app-rg --name fridgeapp-korea-01
```
Expected: the live site opens and the same end-to-end flow works in the browser.

- [ ] **Step 4: Commit any final cleanup**

```powershell
git add .
git commit -m "chore: finalize fridge app deployment"
```
