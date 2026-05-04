import api from './api'
import type { InventoryItem, CreateInventoryItem, PriceHistory, PaginatedResponse } from '@/types'

export interface InventoryFilters {
  search?: string
  category?: string
  status?: 'active' | 'inactive'
  stockLevel?: 'normal' | 'low' | 'critical'
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const inventoryService = {
  async list(filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> {
    const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory', {
      params: filters,
    })
    return response.data
  },

  async getById(id: string): Promise<InventoryItem> {
    const response = await api.get<InventoryItem>(`/inventory/${id}`)
    return response.data
  },

  async create(data: CreateInventoryItem): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>('/inventory', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateInventoryItem>): Promise<InventoryItem> {
    const response = await api.put<InventoryItem>(`/inventory/${id}`, data)
    return response.data
  },

  async updatePrice(
    id: string,
    data: { price: number; quantity: number; unit: string },
  ): Promise<InventoryItem> {
    const response = await api.patch<InventoryItem>(`/inventory/${id}/price`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`)
  },

  async getPriceHistory(id: string): Promise<PriceHistory[]> {
    const response = await api.get<PriceHistory[]>(`/inventory/${id}/price-history`)
    return response.data
  },
}
