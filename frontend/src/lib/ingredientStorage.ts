import type { IngredientName } from '../types'

export const STORAGE_KEY = 'fridge-app.ingredients'

function getStorage(): Storage | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }

  return globalThis.localStorage
}

export function getIngredients(): IngredientName[] {
  const storage = getStorage()
  if (!storage) {
    return []
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is IngredientName => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

function setIngredients(ingredients: IngredientName[]): IngredientName[] {
  const storage = getStorage()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(ingredients))
  }

  return ingredients
}

export function addIngredient(input: string): IngredientName[] {
  const candidate = input.trim()
  const ingredients = getIngredients()

  if (!candidate || ingredients.includes(candidate)) {
    return ingredients
  }

  return setIngredients([...ingredients, candidate])
}

export function removeIngredient(name: IngredientName): IngredientName[] {
  const nextIngredients = getIngredients().filter((ingredient) => ingredient !== name)
  return setIngredients(nextIngredients)
}
