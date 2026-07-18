import type { RecipeSuggestion } from '../types'

type RecipeDetailStatus = 'idle' | 'loading' | 'error' | 'summary'

type RecipeDetailProps = {
  status: RecipeDetailStatus
  recipe: RecipeSuggestion | null
  errorMessage: string | null
}

type IngredientCardItem = {
  name: string
  isOptional: boolean
}

function stripOptionalLabel(value: string): string {
  return value.replace(/\((선택|optional)\)/gi, '').trim()
}

function isOptionalIngredient(value: string): boolean {
  return /\((선택|optional)\)/i.test(value)
}

function normalizeIngredientKey(value: string): string {
  return stripOptionalLabel(value).replace(/\s+/g, '').toLowerCase()
}

function parseRequiredIngredients(ingredients: string[]): IngredientCardItem[] {
  return ingredients.map((ingredient) => ({
    name: stripOptionalLabel(ingredient),
    isOptional: isOptionalIngredient(ingredient),
  }))
}

function parseMissingIngredients(
  missingIngredients: string[],
  requiredItems: IngredientCardItem[],
): IngredientCardItem[] {
  const optionalMap = new Map(
    requiredItems.map((item) => [normalizeIngredientKey(item.name), item.isOptional]),
  )

  return missingIngredients.map((ingredient) => {
    const name = stripOptionalLabel(ingredient)
    const isOptional = optionalMap.get(normalizeIngredientKey(name)) ?? isOptionalIngredient(ingredient)

    return {
      name,
      isOptional,
    }
  })
}

function IngredientCards({
  title,
  items,
  emptyMessage,
  cardType,
}: {
  title: string
  items: IngredientCardItem[]
  emptyMessage: string
  cardType: 'required' | 'missing'
}) {
  return (
    <section className="ingredient-section">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <div className="ingredient-grid">
          {items.map((item) => (
            <article
              key={`${title}-${item.name}`}
              className={`ingredient-card ${cardType} ${item.isOptional ? 'optional' : 'required'}`}
            >
              <strong>{item.name}</strong>
              <small>{cardType === 'missing' ? '부족 재료' : item.isOptional ? '선택 재료' : '필수 재료'}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function RecipeDetail({ status, recipe, errorMessage }: RecipeDetailProps) {
  const requiredItems = recipe ? parseRequiredIngredients(recipe.requiredIngredients) : []
  const missingItems = recipe ? parseMissingIngredients(recipe.missingIngredients, requiredItems) : []

  return (
    <section className="recipe-detail">
      <h2>레시피 상세</h2>
      {status === 'idle' && <p className="empty-state">메뉴를 선택하면 상세 정보를 볼 수 있어요.</p>}

      {status === 'loading' && <p>레시피 요약을 불러오는 중...</p>}

      {status === 'error' && (
        <p className="error-state" role="alert">
          {errorMessage ?? '레시피 상세 정보를 불러오지 못했습니다.'}
        </p>
      )}

      {status === 'summary' && recipe && (
        <article>
          <h3>{recipe.name}</h3>
          <p>{recipe.summary}</p>
          <IngredientCards
            title="필요한 재료"
            items={requiredItems}
            emptyMessage="등록된 재료 정보가 없어요."
            cardType="required"
          />
          <IngredientCards
            title="부족한 재료"
            items={missingItems}
            emptyMessage="현재 부족한 재료가 없어요."
            cardType="missing"
          />
          <section className="ingredient-section">
            <h4>만드는 방법</h4>
            {recipe.steps.length > 0 ? (
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="empty-state">조리 방법 정보가 아직 없어요.</p>
            )}
          </section>
        </article>
      )}
    </section>
  )
}

export type { RecipeDetailStatus }
