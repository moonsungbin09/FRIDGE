import assert from "node:assert/strict";
import test from "node:test";
import {
  AzureOpenAiServiceError,
  generateRecipeSummary,
} from "../src/services/azureOpenAi";

const setAzureEnv = () => {
  process.env.AZURE_OPENAI_ENDPOINT = "https://example.openai.azure.com";
  process.env.AZURE_OPENAI_API_KEY = "test-key";
  process.env.AZURE_OPENAI_DEPLOYMENT = "test-deployment";
  process.env.AZURE_OPENAI_API_VERSION = "2024-02-15-preview";
};

test("generateRecipeSummary maps fetch AbortError to timeout error", async () => {
  setAzureEnv();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    throw new DOMException("Aborted", "AbortError");
  }) as typeof fetch;

  try {
    await assert.rejects(generateRecipeSummary("prompt"), (error) => {
      assert.ok(error instanceof AzureOpenAiServiceError);
      assert.equal(error.kind, "timeout");
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generateRecipeSummary maps generic fetch failures to network error", async () => {
  setAzureEnv();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    throw new Error("socket hang up");
  }) as typeof fetch;

  try {
    await assert.rejects(generateRecipeSummary("prompt"), (error) => {
      assert.ok(error instanceof AzureOpenAiServiceError);
      assert.equal(error.kind, "network");
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generateRecipeSummary sends max_completion_tokens instead of max_tokens", async () => {
  setAzureEnv();
  const originalFetch = globalThis.fetch;
  let requestBody: unknown = null;

  globalThis.fetch = (async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "summary" } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const summary = await generateRecipeSummary("prompt");

    assert.equal(summary, "summary");
    assert.deepEqual(requestBody, {
      messages: [
        {
          role: "system",
          content:
            "너는 냉장고 재료 기반으로 레시피를 한국어로 쉽고 간결하게 요약하는 요리 도우미야.",
        },
        {
          role: "user",
          content: "prompt",
        },
      ],
      max_completion_tokens: 180,
      reasoning_effort: "minimal",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generateRecipeSummary rejects empty Azure summary content", async () => {
  setAzureEnv();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: "" } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  try {
    await assert.rejects(generateRecipeSummary("prompt"), (error) => {
      assert.ok(error instanceof AzureOpenAiServiceError);
      assert.equal(error.kind, "invalid_response");
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
