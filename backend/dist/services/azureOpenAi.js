"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipeSummary = exports.AzureOpenAiServiceError = void 0;
const env_1 = require("../config/env");
class AzureOpenAiServiceError extends Error {
    kind;
    constructor(kind, message) {
        super(message);
        this.kind = kind;
        this.name = "AzureOpenAiServiceError";
    }
}
exports.AzureOpenAiServiceError = AzureOpenAiServiceError;
const AZURE_OPENAI_REQUEST_TIMEOUT_MS = 15_000;
const buildChatCompletionsUrl = () => {
    const { endpoint, deployment, apiVersion } = (0, env_1.getAzureOpenAiConfig)();
    const normalizedEndpoint = endpoint.replace(/\/+$/, "");
    return `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
};
const isAbortError = (error) => error instanceof Error && error.name === "AbortError";
const generateRecipeSummary = async (prompt) => {
    const { apiKey } = (0, env_1.getAzureOpenAiConfig)();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, AZURE_OPENAI_REQUEST_TIMEOUT_MS);
    let response;
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
                        content: "You summarize recipes clearly and briefly for home cooks based on available ingredients.",
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
    }
    catch (error) {
        if (isAbortError(error)) {
            throw new AzureOpenAiServiceError("timeout", `Azure OpenAI request timed out after ${AZURE_OPENAI_REQUEST_TIMEOUT_MS}ms`);
        }
        const reason = error instanceof Error ? error.message : "Unknown fetch error";
        throw new AzureOpenAiServiceError("network", `Azure OpenAI request failed: ${reason}`);
    }
    finally {
        clearTimeout(timeoutId);
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new AzureOpenAiServiceError("http", `Azure OpenAI request failed (${response.status}): ${errorText || response.statusText}`);
    }
    let payload;
    try {
        payload = (await response.json());
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown JSON parse error";
        throw new AzureOpenAiServiceError("invalid_response", `Azure OpenAI response parsing failed: ${reason}`);
    }
    const summary = payload.choices?.[0]?.message?.content?.trim();
    if (!summary) {
        throw new AzureOpenAiServiceError("invalid_response", "Azure OpenAI response did not include a summary");
    }
    return summary;
};
exports.generateRecipeSummary = generateRecipeSummary;
