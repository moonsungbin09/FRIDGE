"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipesRouter = void 0;
const express_1 = require("express");
const azureOpenAi_1 = require("../services/azureOpenAi");
const recipePrompt_1 = require("../services/recipePrompt");
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
const createRecipesRouter = (generateSummary = azureOpenAi_1.generateRecipeSummary) => {
    const router = (0, express_1.Router)();
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
                error: "Invalid payload. Expected recipeName, ingredients, and missingIngredients.",
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
            res.status(502).json({ error: "Failed to generate recipe summary" });
        }
    });
    return router;
};
exports.createRecipesRouter = createRecipesRouter;
const router = (0, exports.createRecipesRouter)();
exports.default = router;
