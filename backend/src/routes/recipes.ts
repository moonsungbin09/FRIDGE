import { Router } from "express";
import { generateRecipeSummary } from "../services/azureOpenAi";
import {
  generateRecipeRecommendations,
  type RecipeRecommendation,
} from "../services/foundryRecipes";
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
export type RecipeRecommendationsGenerator = (
  ingredients: string[],
) => Promise<RecipeRecommendation[]>;

export const createRecipesRouter = (
  generateSummary: RecipeSummaryGenerator = generateRecipeSummary,
  generateRecommendations: RecipeRecommendationsGenerator = generateRecipeRecommendations,
): Router => {
  const router = Router();

  router.post("/recommendations", async (req, res) => {
    const payload = (req.body as { ingredients?: unknown }) ?? {};
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
    } catch (error) {
      console.error("Failed to generate recipe recommendations:", error);
      res.status(502).json({ error: "AI 레시피 추천 생성에 실패했습니다." });
    }
  });

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
        error: "잘못된 요청입니다. recipeName, ingredients, missingIngredients가 필요합니다.",
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
      res.status(502).json({ error: "레시피 요약 생성에 실패했습니다." });
    }
  });

  return router;
};

const router = createRecipesRouter();

export default router;
