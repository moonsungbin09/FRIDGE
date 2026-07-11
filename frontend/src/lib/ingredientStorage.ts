import type { IngredientName } from '../types'

export const STORAGE_KEY = 'fridge-app.ingredients'
let cachedIngredients: IngredientName[] = []

export function resetIngredientStorageCacheForTests(): void {
  cachedIngredients = []
}

function getStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === 'undefined') {
      return null
    }
  } catch {
    return null
  }

  return globalThis.localStorage
}

export function getIngredients(): IngredientName[] {
  const storage = getStorage()
  if (!storage) {
    return cachedIngredients
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    cachedIngredients = []
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    const ingredients = Array.isArray(parsed)
      ? parsed.filter((value): value is IngredientName => typeof value === 'string')
      : []
    cachedIngredients = ingredients
    return ingredients
  } catch {
    cachedIngredients = []
    return cachedIngredients
  }
}

function setIngredients(ingredients: IngredientName[]): IngredientName[] {
  cachedIngredients = ingredients
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(ingredients))
    } catch {
      return ingredients
    }
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
  const target = name.trim()
  const nextIngredients = getIngredients().filter((ingredient) => ingredient !== target)
  return setIngredients(nextIngredients)
}
