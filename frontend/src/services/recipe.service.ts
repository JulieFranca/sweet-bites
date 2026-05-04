import api from './api'
import type { Recipe, CreateRecipe, PaginatedResponse } from '@/types'

export interface RecipeFilters {
  search?: string
  category?: string
  page?: number
  pageSize?: number
}

export const recipeService = {
  async list(filters?: RecipeFilters): Promise<PaginatedResponse<Recipe>> {
    const response = await api.get<PaginatedResponse<Recipe>>('/recipes', {
      params: filters,
    })
    return response.data
  },

  async getById(id: string): Promise<Recipe> {
    const response = await api.get<Recipe>(`/recipes/${id}`)
    return response.data
  },

  async create(data: CreateRecipe): Promise<Recipe> {
    const response = await api.post<Recipe>('/recipes', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateRecipe>): Promise<Recipe> {
    const response = await api.put<Recipe>(`/recipes/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`)
  },

  async getCost(id: string): Promise<{ totalCost: number; costPerUnit: number }> {
    const response = await api.get<{ totalCost: number; costPerUnit: number }>(
      `/recipes/${id}/cost`,
    )
    return response.data
  },
}
