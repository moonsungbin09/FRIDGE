# Fridge App Design

## Goal
Build a simple fridge assistant app where a user can add ingredients, remove ingredients, and get recipe suggestions based on the ingredients saved in the browser.

## Scope
- Show a home screen with three main actions: ingredient add, ingredient remove, and recipe recommendation.
- Let users type ingredients freely and store them in the browser without login.
- Recommend dishes from a predefined ingredient-to-dish matching table.
- Show missing ingredients alongside each recommended dish.
- Use Azure OpenAI to generate a short recipe explanation for the selected dish.
- If public recipe references are used later, keep them as short reference notes and do not copy long source text into the app.
- Keep the app single-user and browser-local.

## Architecture
- Frontend: React + TypeScript in the existing Vite app.
- State storage: browser localStorage for ingredients.
- Recommendation source: predefined in-app matching data.
- AI layer: Azure OpenAI for short recipe descriptions.
- Backend: small Express API to keep the Azure OpenAI key off the client and return recipe summaries.

This keeps the browser UI simple while separating safe AI access from the client.

## Components
- `Home`: entry screen with the three category buttons.
- `IngredientManager`: add and delete ingredient controls.
- `RecipeRecommender`: finds matching dishes and missing ingredients from stored ingredients.
- `RecipeDetail`: shows the AI-generated recipe explanation for a selected dish.
- `RecipeMatchTable`: static data that maps ingredient sets to candidate dishes and required extras.
- `Recipe API`: backend endpoint that receives a dish name and ingredient context, then asks Azure OpenAI for a short explanation.
- `Recipe Reference Notes`: optional short notes from public recipe sources that can help shape the AI prompt without copying source content.

## Data Flow
1. User adds ingredients with free text input.
2. Ingredients are saved in localStorage and rendered back to the UI.
3. User opens recipe recommendation.
4. The app compares saved ingredients against the predefined match table.
5. The app shows candidate dishes and any missing ingredients needed for each dish.
6. User selects a dish.
7. The frontend calls the backend recipe API.
8. The backend asks Azure OpenAI to generate a concise recipe explanation.
9. The frontend displays the explanation in a detail view.

## Error Handling
- Ingredient input should reject empty values and trim whitespace.
- Duplicate ingredients should be handled consistently instead of silently creating repeated entries.
- If localStorage is unavailable, the app should show a clear browser-storage error.
- If the recipe match table has no result, the app should show a friendly “no matching recipes” message.
- If Azure OpenAI fails, the app should show a visible fallback error instead of empty content.

## Testing Strategy
- Validate ingredient add/remove behavior in the frontend.
- Validate that recipe matching returns the expected dishes and missing ingredients.
- Validate that the recipe API returns a usable summary shape for a selected dish.
- Verify that the app still loads correctly after refresh because ingredient data comes from localStorage.

## Success Criteria
1. The app shows the three main actions on the home screen.
2. Users can add and delete ingredients without logging in.
3. Ingredients remain available after refresh in the same browser.
4. Recipe recommendation returns dishes from predefined matching data.
5. Missing ingredients are shown with each recipe suggestion.
6. Selecting a dish returns a short AI-generated recipe explanation through Azure OpenAI.
