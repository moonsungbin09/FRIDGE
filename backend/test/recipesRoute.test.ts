import assert from "node:assert/strict";
import test from "node:test";
import type { AddressInfo } from "node:net";
import express from "express";
import { createRecipesRouter } from "../src/routes/recipes";

const createTestServer = async (
  generateSummary: (prompt: string) => Promise<string>,
): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> => {
  const app = express();
  app.use(express.json());
  app.use("/api/recipes", createRecipesRouter(generateSummary));

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

test("POST /api/recipes/summary returns summary for a valid payload", async () => {
  const prompts: string[] = [];
  const server = await createTestServer(async (prompt) => {
    prompts.push(prompt);
    return "Quick recipe summary";
  });

  try {
    const response = await fetch(`${server.baseUrl}/api/recipes/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeName: "Kimchi Fried Rice",
        ingredients: ["Rice", "Kimchi"],
        missingIngredients: ["Egg"],
      }),
    });
    const body = (await response.json()) as { summary: string };

    assert.equal(response.status, 200);
    assert.deepEqual(body, { summary: "Quick recipe summary" });
    assert.equal(prompts.length, 1);
    assert.match(prompts[0], /Recipe name: Kimchi Fried Rice/);
  } finally {
    await server.close();
  }
});

test("POST /api/recipes/summary returns 400 for an invalid payload", async () => {
  const server = await createTestServer(async () => "unused");

  try {
    const response = await fetch(`${server.baseUrl}/api/recipes/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeName: "Kimchi Fried Rice",
        ingredients: ["Rice", "Kimchi"],
        missingIngredients: "Egg",
      }),
    });
    const body = (await response.json()) as { error: string };

    assert.equal(response.status, 400);
    assert.match(body.error, /Invalid payload/);
  } finally {
    await server.close();
  }
});

test("POST /api/recipes/summary returns 502 when summary generation fails", async () => {
  const originalConsoleError = console.error;
  console.error = () => undefined;
  const server = await createTestServer(async () => {
    throw new Error("Azure down");
  });

  try {
    const response = await fetch(`${server.baseUrl}/api/recipes/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeName: "Kimchi Fried Rice",
        ingredients: ["Rice", "Kimchi"],
        missingIngredients: ["Egg"],
      }),
    });
    const body = (await response.json()) as { error: string };

    assert.equal(response.status, 502);
    assert.equal(body.error, "Failed to generate recipe summary");
  } finally {
    console.error = originalConsoleError;
    await server.close();
  }
});
