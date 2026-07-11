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
