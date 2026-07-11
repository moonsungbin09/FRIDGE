"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAzureOpenAiConfig = void 0;
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
