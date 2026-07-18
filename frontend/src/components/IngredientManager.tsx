import { useState } from 'react'
import type { FormEvent } from 'react'
import { addIngredient, getIngredients, removeIngredient } from '../lib/ingredientStorage'

type IngredientManagerProps = {
  onBack: () => void
}

export function IngredientManager({ onBack }: IngredientManagerProps) {
  const [ingredients, setIngredients] = useState(getIngredients)
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIngredients(addIngredient(inputValue))
    setInputValue('')
  }

  const handleRemove = (name: string) => {
    setIngredients(removeIngredient(name))
  }

  return (
    <main className="ingredient-screen">
      <header className="ingredient-header">
        <h1>재료 관리</h1>
        <button type="button" onClick={onBack}>
          홈으로
        </button>
      </header>

      <form className="ingredient-form" onSubmit={handleSubmit}>
        <label htmlFor="ingredient-input">재료 추가</label>
        <div className="ingredient-input-row">
          <input
            id="ingredient-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="예: 우유"
          />
          <button type="submit">추가</button>
        </div>
      </form>

      <section>
        <h2>내 냉장고 재료</h2>
        {ingredients.length === 0 ? (
          <p className="empty-state">저장된 재료가 아직 없어요.</p>
        ) : (
          <ul className="ingredient-list">
            {ingredients.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <button type="button" onClick={() => handleRemove(name)}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
