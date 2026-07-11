import assert from "node:assert/strict";
import test from "node:test";
import { buildRecipeSummaryPrompt } from "../src/services/recipePrompt";

test("buildRecipeSummaryPrompt includes recipe details and missing ingredients", () => {
  const prompt = buildRecipeSummaryPrompt({
    recipeName: "Kimchi Fried Rice",
    ingredients: ["Cooked rice", "Kimchi", "Egg", "Sesame oil"],
    missingIngredients: ["Gochujang"],
  });

  assert.match(prompt, /Kimchi Fried Rice/);
  assert.match(prompt, /Cooked rice, Kimchi, Egg, Sesame oil/);
  assert.match(prompt, /Gochujang/);
});

test("buildRecipeSummaryPrompt trims surrounding whitespace from recipe name", () => {
  const prompt = buildRecipeSummaryPrompt({
    recipeName: "  Kimchi Fried Rice  ",
    ingredients: ["Cooked rice"],
    missingIngredients: [],
  });

  assert.match(prompt, /Recipe name: Kimchi Fried Rice/);
});
