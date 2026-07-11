import type { IngredientName } from '../types'

export const STORAGE_KEY = 'fridge-app.ingredients'
let cachedIngredients: IngredientName[] = []

export function resetIngredientStorageCacheForTests(): void {
  cachedIngredients = []
}

function normalizeIngredient(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function canonicalizeIngredients(values: unknown[]): IngredientName[] {
  return values
    .filter((value): value is string => typeof value === 'string')
    .map(normalizeIngredient)
    .filter((value): value is IngredientName => value.length > 0)
    .filter((value, index, array) => array.indexOf(value) === index)
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
    const ingredients = Array.isArray(parsed) ? canonicalizeIngredients(parsed) : []
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
  const candidate = normalizeIngredient(input)
  const ingredients = getIngredients()

  if (!candidate || ingredients.includes(candidate)) {
    return ingredients
  }

  return setIngredients([...ingredients, candidate])
}

export function removeIngredient(name: IngredientName): IngredientName[] {
  const target = normalizeIngredient(name)
  const nextIngredients = getIngredients().filter((ingredient) => ingredient !== target)
  return setIngredients(nextIngredients)
}
