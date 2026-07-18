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

  beforeEach(() => {
    resetIngredientStorageCacheForTests()
    localStorage.clear()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['토마토', '치즈']))

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
  })

  it('shows recipe suggestions and the summary detail after selection', async () => {
    vi.useFakeTimers()

    await act(async () => {
      root.render(<App />)
    })

    await act(async () => {
      container.querySelectorAll('button')[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('토마토 파스타')
    expect(container.textContent).toContain('면')

    const recipeButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('토마토 파스타'),
    )

    expect(recipeButton).toBeDefined()

    await act(async () => {
      recipeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('Loading recipe summary...')

    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    expect(container.textContent).toContain('토마토 파스타')
    expect(container.textContent).toContain('토마토와 치즈를 활용해 만드는 간단한 홈스타일 파스타입니다.')
    expect(container.textContent).toContain('Required ingredients: 토마토, 치즈, 면')
  })

  it('홈 화면에서 냉장고 히어로 문구와 액션 버튼이 보인다', async () => {
    await act(async () => {
      root.render(<App />)
    })

    expect(container.textContent).toContain('오늘 냉장고 뭐 먹지?')
    expect(container.textContent).toContain('냉장고 속 재료로 맛있는 메뉴를 추천받아보세요.')
    expect(container.textContent).toContain('재료 관리하기')
    expect(container.textContent).toContain('레시피 보러가기')
  })
})
