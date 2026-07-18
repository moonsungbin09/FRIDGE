import type { IngredientName, RecipeSuggestion } from '../types'
import { recipeMatches } from '../data/recipeMatches'

export type RecipeMatchResult = RecipeSuggestion

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

  const scored = recipeMatches
    .map((recipe) => {
      const normalizedRequired = recipe.requiredIngredients.map(normalizeIngredient)
      const matchedCount = normalizedRequired.filter((ingredient) => ingredientSet.has(ingredient)).length
      const missingIngredients = recipe.requiredIngredients.filter(
        (ingredient) => !ingredientSet.has(normalizeIngredient(ingredient)),
      )

      return {
        ...recipe,
        matchedCount,
        missingIngredients,
        steps: recipe.steps,
      }
    })
    .sort((left, right) => {
      if (right.matchedCount !== left.matchedCount) {
        return right.matchedCount - left.matchedCount
      }

      if (left.missingIngredients.length !== right.missingIngredients.length) {
        return left.missingIngredients.length - right.missingIngredients.length
      }

      return left.name.localeCompare(right.name, 'ko-KR')
    })

  return scored.filter((recipe) => recipe.missingIngredients.length < recipe.requiredIngredients.length)
}
