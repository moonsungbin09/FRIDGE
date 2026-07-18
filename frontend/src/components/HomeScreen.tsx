type HomeScreenProps = {
  onManageIngredients: () => void
  onOpenRecipes: () => void
}

export function HomeScreen({ onManageIngredients, onOpenRecipes }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <header>
        <h1>냉장고 앱</h1>
        <p>냉장고 재료를 관리하고, 보유 재료로 레시피를 추천받아보세요.</p>
      </header>

      <section className="home-actions">
        <article className="action-card">
          <h2>재료 관리</h2>
          <p>냉장고에 있는 재료를 추가하거나 삭제할 수 있어요.</p>
          <button type="button" onClick={onManageIngredients}>
            재료 관리하기
          </button>
        </article>

        <article className="action-card">
          <h2>레시피 추천</h2>
          <p>저장된 재료를 기반으로 메뉴를 추천받을 수 있어요.</p>
          <button type="button" onClick={onOpenRecipes}>
            레시피 보러가기
          </button>
        </article>
      </section>
    </main>
  )
}
