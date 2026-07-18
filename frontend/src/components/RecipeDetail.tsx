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
      <h2>레시피 상세</h2>
      {status === 'idle' && <p className="empty-state">메뉴를 선택하면 상세 정보를 볼 수 있어요.</p>}

      {status === 'loading' && <p>레시피 요약을 불러오는 중...</p>}

      {status === 'error' && (
        <p className="error-state" role="alert">
          {errorMessage ?? '레시피 상세 정보를 불러오지 못했어요.'}
        </p>
      )}

      {status === 'summary' && recipe && (
        <article>
          <h3>{recipe.name}</h3>
          <p>{recipe.summary}</p>
          <p>
            필요한 재료: <strong>{recipe.requiredIngredients.join(', ')}</strong>
          </p>
          <p>
            부족한 재료:{' '}
            <strong>{recipe.missingIngredients.length === 0 ? '없음' : recipe.missingIngredients.join(', ')}</strong>
          </p>
        </article>
      )}
    </section>
  )
}

export type { RecipeDetailStatus }
