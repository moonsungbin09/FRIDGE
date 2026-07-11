import { getAzureOpenAiConfig } from "../config/env";

type AzureOpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const buildChatCompletionsUrl = (): string => {
  const { endpoint, deployment, apiVersion } = getAzureOpenAiConfig();
  const normalizedEndpoint = endpoint.replace(/\/+$/, "");

  return `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(
    apiVersion,
  )}`;
};

export const generateRecipeSummary = async (prompt: string): Promise<string> => {
  const { apiKey } = getAzureOpenAiConfig();
  const response = await fetch(buildChatCompletionsUrl(), {
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
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Azure OpenAI request failed (${response.status}): ${errorText || response.statusText}`,
    );
  }

  const payload = (await response.json()) as AzureOpenAiResponse;
  const summary = payload.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error("Azure OpenAI response did not include a summary");
  }

  return summary;
};
