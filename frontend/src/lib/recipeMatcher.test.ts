import { describe, expect, it } from 'vitest'
import { findRecipeMatches } from './recipeMatcher'

describe('findRecipeMatches', () => {
  it('includes 토마토 파스타 and reports 면 as missing for 토마토 and 치즈', () => {
    const matches = findRecipeMatches(['토마토', '치즈'])
    const pasta = matches.find((recipe) => recipe.name === '토마토 파스타')

    expect(pasta).toBeDefined()
    expect(pasta?.missingIngredients).toEqual(['면'])
  })

  it('includes 김치찌개 for 두부 and 김치', () => {
    const matches = findRecipeMatches(['두부', '김치'])
    const stew = matches.find((recipe) => recipe.name === '김치찌개')

    expect(stew).toBeDefined()
    expect(stew?.missingIngredients).toEqual([])
  })
})
