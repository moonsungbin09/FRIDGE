type HomeScreenProps = {
  onManageIngredients: () => void
  onOpenRecipes: () => void
}

export function HomeScreen({ onManageIngredients, onOpenRecipes }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <header>
        <h1>Fridge App</h1>
        <p>Track your ingredients locally and start recipe discovery from one place.</p>
      </header>

      <section className="home-actions">
        <article className="action-card">
          <h2>Ingredient Management</h2>
          <p>Add and remove ingredients from your fridge list.</p>
          <button type="button" onClick={onManageIngredients}>
            Manage ingredients
          </button>
        </article>

        <article className="action-card">
          <h2>Recipe Recommendation</h2>
          <p>Use your saved ingredients to get recipe ideas.</p>
          <button type="button" onClick={onOpenRecipes}>
            Find recipes
          </button>
        </article>
      </section>
    </main>
  )
}
