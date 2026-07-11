import type { IngredientName } from '../types'

export type RecipeMatchDefinition = {
  id: string
  name: string
  requiredIngredients: IngredientName[]
  summary: string
}

export const recipeMatches: RecipeMatchDefinition[] = [
  {
    id: 'tomato-pasta',
    name: '토마토 파스타',
    requiredIngredients: ['토마토', '치즈', '면'],
    summary: '토마토와 치즈를 활용해 만드는 간단한 홈스타일 파스타입니다.',
  },
  {
    id: 'kimchi-jjigae',
    name: '김치찌개',
    requiredIngredients: ['두부', '김치'],
    summary: '두부와 김치를 중심으로 끓이는 든든한 찌개입니다.',
  },
  {
    id: 'cheese-omelette',
    name: '치즈 오믈렛',
    requiredIngredients: ['달걀', '치즈', '우유'],
    summary: '달걀과 치즈로 빠르게 완성하는 부드러운 오믈렛입니다.',
  },
]
