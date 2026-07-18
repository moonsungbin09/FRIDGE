import { useEffect, useMemo, useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { IngredientManager } from './components/IngredientManager'
import { RecipeDetail } from './components/RecipeDetail'
import type { RecipeDetailStatus } from './components/RecipeDetail'
import { RecipeSuggestions } from './components/RecipeSuggestions'
import { getIngredients } from './lib/ingredientStorage'
import { findRecipeMatches } from './lib/recipeMatcher'
import { fetchRecipeRecommendations } from './lib/recipeApi'
import type { RecipeSuggestion } from './types'
import './App.css'

type Screen = 'home' | 'ingredients' | 'recipes'
type RecommendationsStatus = 'idle' | 'loading' | 'ready' | 'error'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<RecipeDetailStatus>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecipeSuggestion[]>([])
  const [recommendationsStatus, setRecommendationsStatus] = useState<RecommendationsStatus>('idle')
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)

  const availableIngredients = useMemo(() => (screen === 'recipes' ? getIngredients() : []), [screen])
  const selectedRecipe = useMemo(
    () => recommendations.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recommendations, selectedRecipeId],
  )

  useEffect(() => {
    if (screen !== 'recipes') {
      return
    }

    if (availableIngredients.length === 0) {
      setRecommendations([])
      setRecommendationsStatus('ready')
      setRecommendationsError(null)
      return
    }

    const abortController = new AbortController()
    setRecommendationsStatus('loading')
    setRecommendationsError(null)
    setRecommendations([])
    setSelectedRecipeId(null)

    const loadRecommendations = async () => {
      const fallbackRecipes = findRecipeMatches(availableIngredients)

      try {
        const recipes = await fetchRecipeRecommendations(availableIngredients, abortController.signal)
        if (abortController.signal.aborted) {
          return
        }

        setRecommendations(recipes)
        setRecommendationsStatus('ready')
      } catch {
        if (abortController.signal.aborted) {
          return
        }

        setRecommendations(fallbackRecipes)
        setRecommendationsStatus('ready')
        setRecommendationsError(
          fallbackRecipes.length > 0 ? null : 'AI 레시피 추천을 불러오지 못했습니다.',
        )
      }
    }

    loadRecommendations()

    return () => {
      abortController.abort()
    }
  }, [availableIngredients, screen])

  useEffect(() => {
    if (screen !== 'recipes') {
      setSelectedRecipeId(null)
      setDetailStatus('idle')
      setDetailError(null)
      return
    }

    if (!selectedRecipeId) {
      setDetailStatus('idle')
      setDetailError(null)
      return
    }

    setDetailStatus('loading')
    setDetailError(null)
    const timer = setTimeout(() => {
      if (!selectedRecipe) {
        setDetailStatus('error')
        setDetailError('선택한 레시피를 찾을 수 없습니다.')
        return
      }

      if (!selectedRecipe.summary.trim()) {
        setDetailStatus('error')
        setDetailError('레시피 요약 정보를 불러오지 못했습니다.')
        return
      }

      setDetailStatus('summary')
    }, 350)

    return () => {
      clearTimeout(timer)
    }
  }, [screen, selectedRecipe, selectedRecipeId])

  if (screen === 'ingredients') {
    return <IngredientManager onBack={() => setScreen('home')} />
  }

  if (screen === 'recipes') {
    return (
      <main className="recipe-screen">
        <h1>레시피 추천</h1>
        <p>
          저장된 재료: <strong>{availableIngredients.length === 0 ? '없음' : availableIngredients.join(', ')}</strong>
        </p>
        {recommendationsStatus === 'loading' && <p>AI 레시피 추천을 불러오는 중...</p>}
        {recommendationsStatus === 'error' && (
          <p className="error-state" role="alert">
            {recommendationsError}
          </p>
        )}
        <div className="recipe-layout">
          <RecipeSuggestions
            recipes={recommendations}
            selectedRecipeId={selectedRecipeId}
            onSelectRecipe={setSelectedRecipeId}
          />
          <RecipeDetail status={detailStatus} recipe={selectedRecipe} errorMessage={detailError} />
        </div>
        <button type="button" onClick={() => setScreen('home')}>
          홈으로
        </button>
      </main>
    )
  }

  return (
    <HomeScreen
      onManageIngredients={() => setScreen('ingredients')}
      onOpenRecipes={() => setScreen('recipes')}
    />
  )
}

export default App
