import { getAzureOpenAiConfig } from "../config/env";

type AzureOpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type AzureOpenAiServiceErrorKind =
  | "timeout"
  | "network"
  | "http"
  | "invalid_response";

export class AzureOpenAiServiceError extends Error {
  constructor(
    public readonly kind: AzureOpenAiServiceErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "AzureOpenAiServiceError";
  }
}

const AZURE_OPENAI_REQUEST_TIMEOUT_MS = 15_000;

const buildChatCompletionsUrl = (): string => {
  const { endpoint, deployment, apiVersion } = getAzureOpenAiConfig();
  const normalizedEndpoint = endpoint.replace(/\/+$/, "");

  return `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(
    apiVersion,
  )}`;
};

const isAbortError = (error: unknown): error is Error =>
  error instanceof Error && error.name === "AbortError";

export const generateRecipeSummary = async (prompt: string): Promise<string> => {
  const { apiKey } = getAzureOpenAiConfig();
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, AZURE_OPENAI_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(buildChatCompletionsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You summarize recipes clearly and briefly for home cooks based on available ingredients.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 180,
      }),
      signal: abortController.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new AzureOpenAiServiceError(
        "timeout",
        `Azure OpenAI request timed out after ${AZURE_OPENAI_REQUEST_TIMEOUT_MS}ms`,
      );
    }

    const reason = error instanceof Error ? error.message : "Unknown fetch error";
    throw new AzureOpenAiServiceError(
      "network",
      `Azure OpenAI request failed: ${reason}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new AzureOpenAiServiceError(
      "http",
      `Azure OpenAI request failed (${response.status}): ${errorText || response.statusText}`,
    );
  }

  let payload: AzureOpenAiResponse;

  try {
    payload = (await response.json()) as AzureOpenAiResponse;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new AzureOpenAiServiceError(
      "invalid_response",
      `Azure OpenAI response parsing failed: ${reason}`,
    );
  }

  const summary = payload.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new AzureOpenAiServiceError(
      "invalid_response",
      "Azure OpenAI response did not include a summary",
    );
  }

  return summary;
};
