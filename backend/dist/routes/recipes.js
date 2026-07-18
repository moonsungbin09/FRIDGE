"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipesRouter = void 0;
const express_1 = require("express");
const azureOpenAi_1 = require("../services/azureOpenAi");
const foundryRecipes_1 = require("../services/foundryRecipes");
const recipePrompt_1 = require("../services/recipePrompt");
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
const createRecipesRouter = (generateSummary = azureOpenAi_1.generateRecipeSummary, generateRecommendations = foundryRecipes_1.generateRecipeRecommendations) => {
    const router = (0, express_1.Router)();
    router.post("/recommendations", async (req, res) => {
        const payload = req.body ?? {};
        const { ingredients } = payload;
        if (!isStringArray(ingredients) || ingredients.length === 0) {
            res.status(400).json({
                error: "잘못된 요청입니다. ingredients는 비어 있지 않은 문자열 배열이어야 합니다.",
            });
            return;
        }
        try {
            const recipes = await generateRecommendations(ingredients);
            res.json({ recipes });
        }
        catch (error) {
            console.error("Failed to generate recipe recommendations:", error);
            res.status(502).json({ error: "AI 레시피 추천 생성에 실패했습니다." });
        }
    });
    router.post("/summary", async (req, res) => {
        const payload = req.body ?? {};
        const selectedRecipe = payload.recipe && typeof payload.recipe === "object"
            ? payload.recipe
            : payload;
        const recipeName = selectedRecipe.recipeName ?? selectedRecipe.name;
        const ingredients = selectedRecipe.ingredients;
        const missingIngredients = selectedRecipe.missingIngredients;
        if (typeof recipeName !== "string" ||
            !isStringArray(ingredients) ||
            !isStringArray(missingIngredients)) {
            res.status(400).json({
                error: "잘못된 요청입니다. recipeName, ingredients, missingIngredients가 필요합니다.",
            });
            return;
        }
        try {
            const prompt = (0, recipePrompt_1.buildRecipeSummaryPrompt)({
                recipeName,
                ingredients,
                missingIngredients,
            });
            const summary = await generateSummary(prompt);
            res.json({ summary });
        }
        catch (error) {
            console.error("Failed to generate recipe summary:", error);
            res.status(502).json({ error: "레시피 요약 생성에 실패했습니다." });
        }
    });
    return router;
};
exports.createRecipesRouter = createRecipesRouter;
const router = (0, exports.createRecipesRouter)();
exports.default = router;
