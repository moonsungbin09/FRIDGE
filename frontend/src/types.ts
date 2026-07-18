export type IngredientName = string

export type RecipeSuggestion = {
  id: string
  name: string
  summary: string
  requiredIngredients: IngredientName[]
  missingIngredients: IngredientName[]
  steps: string[]
}
