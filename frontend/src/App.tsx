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
        setDetailError('Selected recipe is no longer available.')
        return
      }

      if (!selectedRecipe.summary.trim()) {
        setDetailStatus('error')
        setDetailError('Recipe summary is unavailable right now.')
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
        <h1>Recipe Recommendation</h1>
        <p>
          Saved ingredients: <strong>{availableIngredients.length === 0 ? 'None' : availableIngredients.join(', ')}</strong>
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
          Back to home
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
