import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import express from "express";
import { createRecipesRouter } from "../src/routes/recipes";

const createTestServer = async (
  generateRecommendations: (ingredients: string[]) => Promise<unknown>,
): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> => {
  const app = express();
  app.use(express.json());
  app.use(
    "/api/recipes",
    createRecipesRouter(undefined, generateRecommendations),
  );

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }

              closeResolve();
            });
          }),
      });
    });
  });
};

test("POST /api/recipes/recommendations returns AI recipe recommendations", async () => {
  const server = await createTestServer(async (ingredients) => {
    assert.deepEqual(ingredients, ["토마토", "치즈"]);
    return [
      {
        id: "r1",
        name: "토마토 치즈 파스타",
        summary: "토마토와 치즈로 만드는 빠른 파스타",
        requiredIngredients: ["토마토", "치즈", "면"],
        missingIngredients: ["면"],
        steps: ["면을 삶는다", "토마토 소스를 만든다", "치즈를 넣어 마무리한다"],
      },
    ];
  });

  try {
    const response = await fetch(`${server.baseUrl}/api/recipes/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: ["토마토", "치즈"],
      }),
    });
    const body = (await response.json()) as {
      recipes: Array<{ name: string; steps: string[] }>;
    };

    assert.equal(response.status, 200);
    assert.equal(body.recipes[0]?.name, "토마토 치즈 파스타");
    assert.deepEqual(body.recipes[0]?.steps, [
      "면을 삶는다",
      "토마토 소스를 만든다",
      "치즈를 넣어 마무리한다",
    ]);
  } finally {
    await server.close();
  }
});

test("POST /api/recipes/recommendations returns 400 for invalid ingredients payload", async () => {
  const server = await createTestServer(async () => []);

  try {
    const response = await fetch(`${server.baseUrl}/api/recipes/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: ["토마토", 1],
      }),
    });
    const body = (await response.json()) as { error: string };

    assert.equal(response.status, 400);
    assert.match(body.error, /잘못된 요청/);
  } finally {
    await server.close();
  }
});
