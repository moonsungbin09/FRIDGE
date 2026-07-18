import assert from "node:assert/strict";
import test from "node:test";
import {
  FoundryRecipesServiceError,
  generateRecipeRecommendations,
} from "../src/services/foundryRecipes";

const setFoundryEnv = () => {
  process.env.FOUNDRY_RESPONSES_ENDPOINT =
    "https://fridge-resource.services.ai.azure.com/openai/v1/responses";
  process.env.FOUNDRY_API_KEY = "test-key";
  process.env.FOUNDRY_MODEL = "gpt-5.4-nano";
};

test("generateRecipeRecommendations parses JSON recipe list from Responses API output text", async () => {
  setFoundryEnv();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  recipes: [
                    {
                      name: "토마토 에그 덮밥",
                      summary: "토마토와 달걀로 빠르게 만드는 덮밥",
                      requiredIngredients: ["토마토", "달걀", "밥"],
                      missingIngredients: ["밥"],
                      steps: ["달걀을 스크램블한다", "토마토를 볶는다", "밥 위에 올린다"],
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  try {
    const recipes = await generateRecipeRecommendations(["토마토", "달걀"]);
    assert.equal(recipes.length, 1);
    assert.equal(recipes[0]?.name, "토마토 에그 덮밥");
    assert.deepEqual(recipes[0]?.missingIngredients, ["밥"]);
    assert.equal(recipes[0]?.steps.length, 5);
    assert.deepEqual(recipes[0]?.steps.slice(0, 3), [
      "달걀을 스크램블한다",
      "토마토를 볶는다",
      "밥 위에 올린다",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generateRecipeRecommendations throws invalid_response when model output is empty", async () => {
  setFoundryEnv();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ output: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

  try {
    await assert.rejects(generateRecipeRecommendations(["토마토"]), (error) => {
      assert.ok(error instanceof FoundryRecipesServiceError);
      assert.equal(error.kind, "invalid_response");
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generateRecipeRecommendations prompt allows partial ingredient use and prioritizes tasty menus", async () => {
  setFoundryEnv();
  const originalFetch = globalThis.fetch;
  let requestBody: unknown = null;

  globalThis.fetch = (async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  recipes: [
                    {
                      name: "당근 볶음밥",
                      summary: "당근과 밥을 중심으로 만든 간단한 볶음밥",
                      requiredIngredients: ["당근", "밥", "식용유"],
                      missingIngredients: [],
                      steps: ["당근을 썬다", "밥과 함께 볶는다", "간을 맞춘다"],
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    await generateRecipeRecommendations(["당근", "우유", "토마토", "밥"]);
    const prompt = (requestBody as { input?: string }).input ?? "";
    assert.match(prompt, /모든 재료를 꼭 다 사용할 필요는 없어/);
    assert.match(prompt, /모든 재료를 써도 되고 일부만 사용해도 돼/);
    assert.match(prompt, /맛있는 메뉴를 최우선/);
    assert.match(prompt, /서로 궁합이 좋은 재료 조합/);
    assert.match(prompt, /한국에서 일반적으로 해먹는 현실적인 메뉴/);
    assert.match(prompt, /steps는 반드시 5~6단계/);
    assert.match(prompt, /조리 순서 5~6단계/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
