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
        <h1>Ingredients</h1>
        <button type="button" onClick={onBack}>
          Back to home
        </button>
      </header>

      <form className="ingredient-form" onSubmit={handleSubmit}>
        <label htmlFor="ingredient-input">Add ingredient</label>
        <div className="ingredient-input-row">
          <input
            id="ingredient-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="e.g. milk"
          />
          <button type="submit">Add</button>
        </div>
      </form>

      <section>
        <h2>Your fridge list</h2>
        {ingredients.length === 0 ? (
          <p className="empty-state">No ingredients saved yet.</p>
        ) : (
          <ul className="ingredient-list">
            {ingredients.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <button type="button" onClick={() => handleRemove(name)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
