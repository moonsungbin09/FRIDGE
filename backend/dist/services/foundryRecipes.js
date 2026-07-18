"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipeRecommendations = exports.FoundryRecipesServiceError = void 0;
const env_1 = require("../config/env");
class FoundryRecipesServiceError extends Error {
    kind;
    constructor(kind, message) {
        super(message);
        this.kind = kind;
        this.name = "FoundryRecipesServiceError";
    }
}
exports.FoundryRecipesServiceError = FoundryRecipesServiceError;
const REQUEST_TIMEOUT_MS = 20_000;
const isAbortError = (error) => error instanceof Error && error.name === "AbortError";
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
const ensureDetailedSteps = (steps) => {
    const normalized = steps.map((step) => step.trim()).filter(Boolean);
    if (normalized.length === 0) {
        return [];
    }
    if (normalized.length >= 5) {
        return normalized.slice(0, 6);
    }
    const fallbackSteps = [
        "재료를 손질하고 필요한 양을 미리 계량해 조리 순서를 준비한다.",
        "중약불에서 타지 않도록 저어가며 재료를 고르게 익힌다.",
        "맛을 보고 부족한 간은 소금이나 간장으로 마지막에 맞춘다.",
        "불을 끄고 1분 정도 뜸 들인 뒤 접시에 담아 마무리한다.",
    ];
    const detailedSteps = [...normalized];
    for (const fallback of fallbackSteps) {
        if (detailedSteps.length >= 5) {
            break;
        }
        detailedSteps.push(fallback);
    }
    return detailedSteps.slice(0, 6);
};
const toRecipeId = (name) => {
    const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return normalized || `recipe-${Date.now()}`;
};
const parseOutputText = (payload) => {
    const text = payload.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text" && typeof item.text === "string")
        ?.text;
    if (!text) {
        throw new FoundryRecipesServiceError("invalid_response", "Model output text is missing.");
    }
    return text;
};
const normalizeRecipes = (raw) => {
    if (!raw || typeof raw !== "object") {
        throw new FoundryRecipesServiceError("invalid_response", "Model response JSON is not an object.");
    }
    const candidates = raw.recipes;
    if (!Array.isArray(candidates) || candidates.length === 0) {
        throw new FoundryRecipesServiceError("invalid_response", "Model response does not contain recipes.");
    }
    const recipes = candidates
        .map((candidate) => {
        const item = candidate;
        if (typeof item.name !== "string" ||
            typeof item.summary !== "string" ||
            !isStringArray(item.requiredIngredients) ||
            !isStringArray(item.missingIngredients) ||
            !isStringArray(item.steps)) {
            return null;
        }
        const name = item.name.trim();
        const summary = item.summary.trim();
        const steps = ensureDetailedSteps(item.steps);
        if (!name || !summary || steps.length === 0) {
            return null;
        }
        return {
            id: toRecipeId(name),
            name,
            summary,
            requiredIngredients: item.requiredIngredients.map((value) => value.trim()),
            missingIngredients: item.missingIngredients.map((value) => value.trim()),
            steps,
        };
    })
        .filter((recipe) => recipe !== null);
    if (recipes.length === 0) {
        throw new FoundryRecipesServiceError("invalid_response", "Model response recipes have an invalid schema.");
    }
    return recipes;
};
const buildPrompt = (ingredients) => `
너는 냉장고 재료 기반 레시피 추천 도우미야.
아래 재료를 중심으로 집에서 만들기 쉬운 메뉴 3개를 추천해.
모든 재료를 꼭 다 사용할 필요는 없어. 모든 재료를 써도 되고 일부만 사용해도 돼.
맛있는 메뉴를 최우선으로 추천하고, 서로 궁합이 좋은 재료 조합을 우선해.
한국에서 일반적으로 해먹는 현실적인 메뉴 위주로 추천해.
각 메뉴의 steps는 반드시 5~6단계로 작성해.
각 단계에는 가능하면 시간(예: 2분), 불 세기(약불/중불/강불), 핵심 팁을 포함해.
출력은 반드시 JSON 객체 하나로만 반환하고, 설명 문장이나 코드블록은 절대 포함하지 마.

JSON 스키마:
{
  "recipes": [
    {
      "name": "메뉴 이름",
      "summary": "2문장 이내 설명",
      "requiredIngredients": ["필수 재료 목록"],
      "missingIngredients": ["없으면 빈 배열"],
      "steps": ["조리 순서 5~6단계"]
    }
  ]
}

사용자 보유 재료: ${ingredients.join(", ")}
`.trim();
const generateRecipeRecommendations = async (ingredients) => {
    const config = (0, env_1.getFoundryResponsesConfig)();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, REQUEST_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(config.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": config.apiKey,
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                input: buildPrompt(ingredients),
            }),
            signal: abortController.signal,
        });
    }
    catch (error) {
        if (isAbortError(error)) {
            throw new FoundryRecipesServiceError("timeout", `Foundry request timed out after ${REQUEST_TIMEOUT_MS}ms`);
        }
        const reason = error instanceof Error ? error.message : "Unknown fetch error";
        throw new FoundryRecipesServiceError("network", `Foundry request failed: ${reason}`);
    }
    finally {
        clearTimeout(timeoutId);
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new FoundryRecipesServiceError("http", `Foundry request failed (${response.status}): ${errorText || response.statusText}`);
    }
    let payload;
    try {
        payload = (await response.json());
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown JSON parse error";
        throw new FoundryRecipesServiceError("invalid_response", `Foundry response parsing failed: ${reason}`);
    }
    const outputText = parseOutputText(payload);
    let parsed;
    try {
        parsed = JSON.parse(outputText);
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown JSON parse error";
        throw new FoundryRecipesServiceError("invalid_response", `Model output is not valid JSON: ${reason}`);
    }
    return normalizeRecipes(parsed);
};
exports.generateRecipeRecommendations = generateRecipeRecommendations;
