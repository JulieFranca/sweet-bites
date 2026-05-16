import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipeService, type RecipeFilters } from '@/services/recipe.service'
import type { Recipe, CreateRecipe } from '@/types'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const hasMore = ref(false)

  async function fetchRecipes(filters?: RecipeFilters): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await recipeService.list(filters)
      recipes.value = response.data
      total.value = response.total
      page.value = response.page
      hasMore.value = response.hasMore
    } catch {
      error.value = 'Erro ao carregar receitas'
    } finally {
      loading.value = false
    }
  }

  async function fetchRecipe(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentRecipe.value = await recipeService.getById(id)
    } catch {
      error.value = 'Erro ao carregar receita'
    } finally {
      loading.value = false
    }
  }

  async function createRecipe(data: CreateRecipe): Promise<Recipe> {
    loading.value = true
    error.value = null
    try {
      const recipe = await recipeService.create(data)
      recipes.value.unshift(recipe)
      return recipe
    } catch {
      error.value = 'Erro ao criar receita'
      throw new Error('Erro ao criar receita')
    } finally {
      loading.value = false
    }
  }

  async function updateRecipe(
    id: string,
    data: Partial<CreateRecipe>,
  ): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const updated = await recipeService.update(id, data)
      const index = recipes.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        recipes.value[index] = updated
      }
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = updated
      }
    } catch {
      error.value = 'Erro ao atualizar receita'
      throw new Error('Erro ao atualizar receita')
    } finally {
      loading.value = false
    }
  }

  async function deleteRecipe(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await recipeService.delete(id)
      recipes.value = recipes.value.filter((r) => r.id !== id)
    } catch {
      error.value = 'Erro ao excluir receita'
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    currentRecipe,
    loading,
    error,
    total,
    page,
    hasMore,
    fetchRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }
})
