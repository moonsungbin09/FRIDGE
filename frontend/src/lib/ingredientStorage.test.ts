import { beforeEach, describe, expect, it } from 'vitest'
import {
  addIngredient,
  getIngredients,
  removeIngredient,
  STORAGE_KEY,
} from './ingredientStorage'

function createStorageMock(): Storage {
  const data = new Map<string, string>()

  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => {
      data.delete(key)
    },
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

describe('ingredientStorage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createStorageMock(),
    })
  })

  it('stores and returns unique trimmed ingredients and removes by name', () => {
    expect(getIngredients()).toEqual([])

    expect(addIngredient('  milk  ')).toEqual(['milk'])
    expect(addIngredient('milk')).toEqual(['milk'])
    expect(addIngredient('')).toEqual(['milk'])

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['milk'])
    expect(removeIngredient('milk')).toEqual([])
    expect(getIngredients()).toEqual([])
  })

  it('falls back safely when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('storage blocked')
      },
    })

    expect(getIngredients()).toEqual([])
    expect(addIngredient('eggs')).toEqual(['eggs'])
    expect(removeIngredient('eggs')).toEqual([])
  })
})
