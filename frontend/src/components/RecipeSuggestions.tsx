import type { RecipeMatchResult } from '../lib/recipeMatcher'

type RecipeSuggestionsProps = {
  recipes: RecipeMatchResult[]
  selectedRecipeId: string | null
  onSelectRecipe: (recipeId: string) => void
}

export function RecipeSuggestions({ recipes, selectedRecipeId, onSelectRecipe }: RecipeSuggestionsProps) {
  return (
    <section>
      <h2>Recipe suggestions</h2>
      {recipes.length === 0 ? (
        <p className="empty-state">No matches yet. Add more ingredients and try again.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map((recipe) => {
            const isSelected = recipe.id === selectedRecipeId
            const missingLabel =
              recipe.missingIngredients.length === 0
                ? 'Ready to cook'
                : `Missing: ${recipe.missingIngredients.join(', ')}`

            return (
              <li key={recipe.id}>
                <button
                  className={`recipe-select-button${isSelected ? ' is-selected' : ''}`}
                  type="button"
                  onClick={() => onSelectRecipe(recipe.id)}
                >
                  <strong>{recipe.name}</strong>
                  <span>{missingLabel}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
