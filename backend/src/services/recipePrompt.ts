export type RecipePromptInput = {
  recipeName: string;
  ingredients: string[];
  missingIngredients: string[];
};

const formatIngredientList = (items: string[]): string =>
  items.length > 0 ? items.join(", ") : "None";

export const buildRecipeSummaryPrompt = ({
  recipeName,
  ingredients,
  missingIngredients,
}: RecipePromptInput): string => `
You are a cooking assistant.
Write a concise summary (2-3 sentences) for this recipe and mention how missing ingredients affect preparation.

Recipe name: ${recipeName.trim()}
Ingredients: ${formatIngredientList(ingredients)}
Missing ingredients: ${formatIngredientList(missingIngredients)}
`.trim();
