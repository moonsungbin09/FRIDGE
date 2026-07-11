import { Router } from "express";
import { generateRecipeSummary } from "../services/azureOpenAi";
import { buildRecipeSummaryPrompt } from "../services/recipePrompt";

type RecipeSummaryRequest = {
  recipe?: unknown;
  name?: unknown;
  recipeName?: unknown;
  ingredients?: unknown;
  missingIngredients?: unknown;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export type RecipeSummaryGenerator = (prompt: string) => Promise<string>;

export const createRecipesRouter = (
  generateSummary: RecipeSummaryGenerator = generateRecipeSummary,
): Router => {
  const router = Router();

  router.post("/summary", async (req, res) => {
    const payload = (req.body as RecipeSummaryRequest) ?? {};
    const selectedRecipe =
      payload.recipe && typeof payload.recipe === "object"
        ? (payload.recipe as RecipeSummaryRequest)
        : payload;
    const recipeName = selectedRecipe.recipeName ?? selectedRecipe.name;
    const ingredients = selectedRecipe.ingredients;
    const missingIngredients = selectedRecipe.missingIngredients;

    if (
      typeof recipeName !== "string" ||
      !isStringArray(ingredients) ||
      !isStringArray(missingIngredients)
    ) {
      res.status(400).json({
        error:
          "Invalid payload. Expected recipeName, ingredients, and missingIngredients.",
      });
      return;
    }

    try {
      const prompt = buildRecipeSummaryPrompt({
        recipeName,
        ingredients,
        missingIngredients,
      });
      const summary = await generateSummary(prompt);
      res.json({ summary });
    } catch (error) {
      console.error("Failed to generate recipe summary:", error);
      res.status(502).json({ error: "Failed to generate recipe summary" });
    }
  });

  return router;
};

const router = createRecipesRouter();

export default router;
