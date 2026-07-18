"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoundryResponsesConfig = exports.getAzureOpenAiConfig = void 0;
const getRequiredEnv = (name) => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};
const getAzureOpenAiConfig = () => ({
    endpoint: getRequiredEnv("AZURE_OPENAI_ENDPOINT"),
    apiKey: getRequiredEnv("AZURE_OPENAI_API_KEY"),
    deployment: getRequiredEnv("AZURE_OPENAI_DEPLOYMENT"),
    apiVersion: getRequiredEnv("AZURE_OPENAI_API_VERSION"),
});
exports.getAzureOpenAiConfig = getAzureOpenAiConfig;
const getFoundryResponsesConfig = () => ({
    endpoint: getRequiredEnv("FOUNDRY_RESPONSES_ENDPOINT"),
    apiKey: getRequiredEnv("FOUNDRY_API_KEY"),
    model: process.env.FOUNDRY_MODEL?.trim() || "gpt-5.4-nano",
});
exports.getFoundryResponsesConfig = getFoundryResponsesConfig;
