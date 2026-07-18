const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export type AzureOpenAiConfig = {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
};

export const getAzureOpenAiConfig = (): AzureOpenAiConfig => ({
  endpoint: getRequiredEnv("AZURE_OPENAI_ENDPOINT"),
  apiKey: getRequiredEnv("AZURE_OPENAI_API_KEY"),
  deployment: getRequiredEnv("AZURE_OPENAI_DEPLOYMENT"),
  apiVersion: getRequiredEnv("AZURE_OPENAI_API_VERSION"),
});

export type FoundryResponsesConfig = {
  endpoint: string;
  apiKey: string;
  model: string;
};

export const getFoundryResponsesConfig = (): FoundryResponsesConfig => ({
  endpoint: getRequiredEnv("FOUNDRY_RESPONSES_ENDPOINT"),
  apiKey: getRequiredEnv("FOUNDRY_API_KEY"),
  model: process.env.FOUNDRY_MODEL?.trim() || "gpt-5.4-nano",
});
