import { create } from 'zustand'
import { MOCK_USER, MOCK_RECIPES, MEAL_PLAN_MOCK, SHOPPING_LIST } from '../data/mockData'

export const useAuthStore = create((set) => ({
  user: MOCK_USER,
  isLoggedIn: true,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))

export const useRecipeStore = create((set, get) => ({
  recipes: MOCK_RECIPES,
  savedIds: ['1', '4', '7'],
  toggleSave: (id) => {
    const saved = get().savedIds
    set({ savedIds: saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id] })
  },
  addRecipe: (recipe) => set({ recipes: [recipe, ...get().recipes] }),
}))

export const usePlannerStore = create((set, get) => ({
  mealPlan: MEAL_PLAN_MOCK.meals,
  shoppingList: SHOPPING_LIST,
  setMeal: (day, mealType, recipe) => {
    const plan = { ...get().mealPlan }
    plan[day] = { ...plan[day], [mealType]: recipe }
    set({ mealPlan: plan })
  },
  clearMeal: (day, mealType) => {
    const plan = { ...get().mealPlan }
    if (plan[day]) plan[day] = { ...plan[day], [mealType]: null }
    set({ mealPlan: plan })
  },
  toggleShoppingItem: (catIndex, itemIndex) => {
    const list = get().shoppingList.map((cat, ci) => ({
      ...cat,
      items: cat.items.map((item, ii) =>
        ci === catIndex && ii === itemIndex ? { ...item, checked: !item.checked } : item
      )
    }))
    set({ shoppingList: list })
  }
}))
