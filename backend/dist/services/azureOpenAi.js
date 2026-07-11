"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipeSummary = void 0;
const env_1 = require("../config/env");
const buildChatCompletionsUrl = () => {
    const { endpoint, deployment, apiVersion } = (0, env_1.getAzureOpenAiConfig)();
    const normalizedEndpoint = endpoint.replace(/\/+$/, "");
    return `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
};
const generateRecipeSummary = async (prompt) => {
    const { apiKey } = (0, env_1.getAzureOpenAiConfig)();
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
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI request failed (${response.status}): ${errorText || response.statusText}`);
    }
    const payload = (await response.json());
    const summary = payload.choices?.[0]?.message?.content?.trim();
    if (!summary) {
        throw new Error("Azure OpenAI response did not include a summary");
    }
    return summary;
};
exports.generateRecipeSummary = generateRecipeSummary;
