type HomeScreenProps = {
  onManageIngredients: () => void
  onOpenRecipes: () => void
}

export function HomeScreen({ onManageIngredients, onOpenRecipes }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <section className="home-hero">
        <div className="home-hero-visual" aria-hidden>
          <div className="fridge-illustration">
            <span className="fridge-emoji">🧊</span>
            <span className="food food-a">🥕</span>
            <span className="food food-b">🍅</span>
            <span className="food food-c">🥛</span>
          </div>
        </div>
        <div className="home-hero-content">
          <h1>냉장고 앱</h1>
          <h2>오늘 냉장고 뭐 먹지?</h2>
          <p>냉장고 속 재료로 맛있는 메뉴를 추천받아보세요.</p>
        </div>
      </section>

      <section className="home-actions">
        <article className="action-card">
          <p className="action-badge">기본 관리</p>
          <h2>재료 관리</h2>
          <p>냉장고에 있는 재료를 추가하거나 삭제할 수 있어요.</p>
          <button type="button" onClick={onManageIngredients}>
            재료 관리하기
          </button>
        </article>

        <article className="action-card">
          <p className="action-badge">AI 추천</p>
          <h2>레시피 추천</h2>
          <p>저장된 재료를 기반으로 맛있는 메뉴를 추천받을 수 있어요.</p>
          <button type="button" onClick={onOpenRecipes}>
            레시피 보러가기
          </button>
        </article>
      </section>
    </main>
  )
}
