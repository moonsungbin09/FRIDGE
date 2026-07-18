import type { RecipeSuggestion } from '../types'

type RecipeSuggestionsProps = {
  recipes: RecipeSuggestion[]
  selectedRecipeId: string | null
  onSelectRecipe: (recipeId: string) => void
}

export function RecipeSuggestions({ recipes, selectedRecipeId, onSelectRecipe }: RecipeSuggestionsProps) {
  return (
    <section>
      <h2>추천 메뉴</h2>
      {recipes.length === 0 ? (
        <p className="empty-state">AI 추천 결과가 없어요. 재료를 더 추가해보세요.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map((recipe) => {
            const isSelected = recipe.id === selectedRecipeId
            const missingLabel =
              recipe.missingIngredients.length === 0
                ? '바로 조리 가능'
                : `부족 재료: ${recipe.missingIngredients.join(', ')}`

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
