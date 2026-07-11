import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { IngredientManager } from './components/IngredientManager'
import './App.css'

type Screen = 'home' | 'ingredients' | 'recipes'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'ingredients') {
    return <IngredientManager onBack={() => setScreen('home')} />
  }

  if (screen === 'recipes') {
    return (
      <main className="placeholder-screen">
        <h1>Recipe Recommendation</h1>
        <p>This area is reserved for the next task.</p>
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
