import type { RecipeMatchResult } from '../lib/recipeMatcher'

type RecipeDetailStatus = 'idle' | 'loading' | 'error' | 'summary'

type RecipeDetailProps = {
  status: RecipeDetailStatus
  recipe: RecipeMatchResult | null
  errorMessage: string | null
}

export function RecipeDetail({ status, recipe, errorMessage }: RecipeDetailProps) {
  return (
    <section className="recipe-detail">
      <h2>Recipe detail</h2>
      {status === 'idle' && <p className="empty-state">Select a recipe to view details.</p>}

      {status === 'loading' && <p>Loading recipe summary...</p>}

      {status === 'error' && (
        <p className="error-state" role="alert">
          {errorMessage ?? 'Unable to load recipe details.'}
        </p>
      )}

      {status === 'summary' && recipe && (
        <article>
          <h3>{recipe.name}</h3>
          <p>{recipe.summary}</p>
          <p>
            Required ingredients: <strong>{recipe.requiredIngredients.join(', ')}</strong>
          </p>
          <p>
            Missing ingredients:{' '}
            <strong>{recipe.missingIngredients.length === 0 ? 'None' : recipe.missingIngredients.join(', ')}</strong>
          </p>
        </article>
      )}
    </section>
  )
}

export type { RecipeDetailStatus }
