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
  {
    id: 'tomato-cheese-salad',
    name: '토마토 치즈 샐러드',
    requiredIngredients: ['토마토', '치즈', '올리브오일'],
    summary: '토마토와 치즈를 곁들여 가볍게 즐기는 샐러드입니다.',
  },
  {
    id: 'cheese-toast',
    name: '치즈 토스트',
    requiredIngredients: ['치즈', '식빵', '버터'],
    summary: '치즈를 올려 노릇하게 구워내는 간단한 토스트입니다.',
  },
  {
    id: 'tomato-egg-stir-fry',
    name: '토마토 달걀볶음',
    requiredIngredients: ['토마토', '달걀', '식용유'],
    summary: '토마토와 달걀을 부드럽게 볶아내는 집반찬입니다.',
  },
  {
    id: 'carrot-fried-rice',
    name: '당근 볶음밥',
    requiredIngredients: ['당근', '밥', '달걀'],
    summary: '당근과 밥으로 담백하게 만드는 한 끼 볶음밥입니다.',
  },
]
