import type { IngredientName } from '../types'
import { recipeMatches } from '../data/recipeMatches'

export type RecipeMatchResult = {
  id: string
  name: string
  requiredIngredients: IngredientName[]
  missingIngredients: IngredientName[]
  summary: string
}

function normalizeIngredient(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function findRecipeMatches(ingredients: IngredientName[]): RecipeMatchResult[] {
  const ingredientSet = new Set(
    ingredients.map(normalizeIngredient).filter((ingredient): ingredient is IngredientName => ingredient.length > 0),
  )

  if (ingredientSet.size === 0) {
    return []
  }

  return recipeMatches
    .map((recipe) => {
      const missingIngredients = recipe.requiredIngredients.filter(
        (ingredient) => !ingredientSet.has(normalizeIngredient(ingredient)),
      )

      return {
        ...recipe,
        missingIngredients,
      }
    })
    .filter((recipe) => recipe.missingIngredients.length < recipe.requiredIngredients.length)
    .sort(
      (left, right) =>
        left.missingIngredients.length - right.missingIngredients.length ||
        left.name.localeCompare(right.name, 'ko-KR'),
    )
}
