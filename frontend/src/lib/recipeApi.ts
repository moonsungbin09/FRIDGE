import type { RecipeSuggestion } from '../types'

type RecommendationsApiResponse = {
  recipes?: unknown
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const toRecipeSuggestions = (payload: unknown): RecipeSuggestion[] => {
  const recipes = (payload as RecommendationsApiResponse).recipes
  if (!Array.isArray(recipes)) {
    throw new Error('Invalid recommendations response')
  }

  return recipes
    .map((candidate, index): RecipeSuggestion | null => {
      if (!candidate || typeof candidate !== 'object') {
        return null
      }

      const item = candidate as Record<string, unknown>
      if (
        typeof item.name !== 'string' ||
        typeof item.summary !== 'string' ||
        !isStringArray(item.requiredIngredients) ||
        !isStringArray(item.missingIngredients) ||
        !isStringArray(item.steps)
      ) {
        return null
      }

      const name = item.name.trim()
      if (!name) {
        return null
      }

      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `ai-${index}-${name}`

      return {
        id,
        name,
        summary: item.summary.trim(),
        requiredIngredients: item.requiredIngredients,
        missingIngredients: item.missingIngredients,
        steps: item.steps,
      }
    })
    .filter((recipe): recipe is RecipeSuggestion => recipe !== null)
}

export async function fetchRecipeRecommendations(
  ingredients: string[],
  signal?: AbortSignal,
): Promise<RecipeSuggestion[]> {
  const response = await fetch('/api/recipes/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients }),
    signal,
  })

  if (!response.ok) {
    throw new Error('Failed to load recipe recommendations')
  }

  const payload = (await response.json()) as unknown
  return toRecipeSuggestions(payload)
}
