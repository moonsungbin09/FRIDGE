// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { resetIngredientStorageCacheForTests, STORAGE_KEY } from './lib/ingredientStorage'

type ReactActGlobal = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

(globalThis as ReactActGlobal).IS_REACT_ACT_ENVIRONMENT = true

describe('App recipe flow', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let originalFetch: typeof fetch

  beforeEach(() => {
    resetIngredientStorageCacheForTests()
    localStorage.clear()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['토마토', '치즈']))
    originalFetch = globalThis.fetch

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
    resetIngredientStorageCacheForTests()
    localStorage.clear()
    globalThis.fetch = originalFetch
  })

  it('AI 추천을 불러오고 선택한 레시피 상세를 보여준다', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          recipes: [
            {
              id: 'ai-1',
              name: '당근 볶음',
              summary: '당근을 달콤짭짤하게 볶아 만드는 반찬입니다.',
              requiredIngredients: ['당근', '간장', '설탕', '식용유', '버터(선택)'],
              missingIngredients: ['간장', '설탕', '식용유'],
              steps: ['당근을 채 썬다', '양념을 섞는다', '팬에서 볶아 완성한다'],
            },
          ],
        }),
      ),
    ) as typeof fetch
    vi.useFakeTimers()

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      container.querySelectorAll('button')[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.querySelectorAll('.recipe-list li').length).toBe(1)

    const recipeButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('당근 볶음'),
    )

    expect(recipeButton).toBeDefined()

    await act(async () => {
      recipeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('레시피 요약을 불러오는 중...')

    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(container.textContent).toContain('당근 볶음')
    expect(container.textContent).toContain('당근을 달콤짭짤하게 볶아 만드는 반찬입니다.')
    expect(container.textContent).toContain('필요한 재료')
    expect(container.textContent).toContain('부족한 재료')
    expect(container.textContent).toContain('만드는 방법')
    expect(container.textContent).toContain('당근')
    expect(container.textContent).toContain('버터')

    const requiredCards = container.querySelectorAll('.ingredient-card.required')
    const missingCards = container.querySelectorAll('.ingredient-card.missing')
    const optionalCards = container.querySelectorAll('.ingredient-card.optional')
    expect(requiredCards.length).toBeGreaterThanOrEqual(4)
    expect(missingCards.length).toBeGreaterThanOrEqual(3)
    expect(optionalCards.length).toBeGreaterThanOrEqual(1)

    const soySauceCard = Array.from(container.querySelectorAll('.ingredient-card')).find((card) =>
      card.textContent?.includes('간장'),
    )
    const sugarCard = Array.from(container.querySelectorAll('.ingredient-card')).find((card) =>
      card.textContent?.includes('설탕'),
    )
    const butterCard = Array.from(container.querySelectorAll('.ingredient-card.optional')).find((card) =>
      card.textContent?.includes('버터'),
    )

    expect(soySauceCard?.textContent).toContain('🍶')
    expect(sugarCard?.textContent).toContain('🍬')
    expect(butterCard?.textContent).toContain('🧈')
  })

  it('AI 추천이 실패해도 기본 레시피 추천을 보여준다', async () => {
    globalThis.fetch = vi.fn(async () => new Response('error', { status: 502 })) as typeof fetch
    vi.useFakeTimers()

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      container.querySelectorAll('button')[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain('토마토 파스타')
    expect(container.textContent).toContain('치즈 오믈렛')
    expect(container.querySelectorAll('.recipe-list li').length).toBeGreaterThanOrEqual(2)

    const pastaButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('토마토 파스타'),
    )

    await act(async () => {
      pastaButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      vi.advanceTimersByTime(350)
      await Promise.resolve()
    })

    expect(container.textContent).toContain('만드는 방법')
  })
})
