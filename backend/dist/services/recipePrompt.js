"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecipeSummaryPrompt = void 0;
const formatIngredientList = (items) => items.length > 0 ? items.join(", ") : "None";
const buildRecipeSummaryPrompt = ({ recipeName, ingredients, missingIngredients, }) => `
You are a cooking assistant.
Write a concise summary (2-3 sentences) for this recipe and mention how missing ingredients affect preparation.

Recipe name: ${recipeName.trim()}
Ingredients: ${formatIngredientList(ingredients)}
Missing ingredients: ${formatIngredientList(missingIngredients)}
`.trim();
exports.buildRecipeSummaryPrompt = buildRecipeSummaryPrompt;
