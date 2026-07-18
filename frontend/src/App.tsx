import { useEffect, useMemo, useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { IngredientManager } from './components/IngredientManager'
import { RecipeDetail } from './components/RecipeDetail'
import type { RecipeDetailStatus } from './components/RecipeDetail'
import { RecipeSuggestions } from './components/RecipeSuggestions'
import { getIngredients } from './lib/ingredientStorage'
import { findRecipeMatches } from './lib/recipeMatcher'
import './App.css'

type Screen = 'home' | 'ingredients' | 'recipes'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<RecipeDetailStatus>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)

  const availableIngredients = useMemo(() => (screen === 'recipes' ? getIngredients() : []), [screen])
  const recipeMatches = useMemo(() => findRecipeMatches(availableIngredients), [availableIngredients])
  const selectedRecipe = useMemo(
    () => recipeMatches.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipeMatches, selectedRecipeId],
  )

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
        setDetailError('선택한 레시피를 찾을 수 없어요.')
        return
      }

      if (!selectedRecipe.summary.trim()) {
        setDetailStatus('error')
        setDetailError('레시피 요약 정보를 불러오지 못했어요.')
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
        <div className="recipe-layout">
          <RecipeSuggestions
            recipes={recipeMatches}
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
