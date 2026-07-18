export type RecipePromptInput = {
  recipeName: string;
  ingredients: string[];
  missingIngredients: string[];
};

const formatIngredientList = (items: string[]): string =>
  items.length > 0 ? items.join(", ") : "없음";

export const buildRecipeSummaryPrompt = ({
  recipeName,
  ingredients,
  missingIngredients,
}: RecipePromptInput): string => `
너는 요리 도우미야.
이 레시피를 2~3문장으로 간결하게 요약하고, 부족한 재료가 조리에 어떤 영향을 주는지 함께 설명해.

레시피 이름: ${recipeName.trim()}
보유 재료: ${formatIngredientList(ingredients)}
부족한 재료: ${formatIngredientList(missingIngredients)}
`.trim();
