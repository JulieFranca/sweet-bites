import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { inventoryService, type InventoryFilters } from '@/services/inventory.service'
import type { InventoryItem, CreateInventoryItem } from '@/types'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const currentItem = ref<InventoryItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const hasMore = ref(false)
  const filters = ref<InventoryFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  const lowStockItems = computed(() =>
    items.value.filter(
      (item) => item.isActive && item.currentQuantity <= item.minimumQuantity,
    ),
  )

  const activeItems = computed(() =>
    items.value.filter((item) => item.isActive),
  )

  const ingredientItems = computed(() =>
    activeItems.value.filter((item) => item.category === 'ingredient'),
  )

  const packagingItems = computed(() =>
    activeItems.value.filter((item) => item.category === 'packaging'),
  )

  async function fetchItems(newFilters?: Partial<InventoryFilters>): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }
      const response = await inventoryService.list(filters.value)
      items.value = response.data
      total.value = response.total
      page.value = response.page
      hasMore.value = response.hasMore
    } catch {
      error.value = 'Erro ao carregar inventario'
    } finally {
      loading.value = false
    }
  }

  async function fetchItem(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentItem.value = await inventoryService.getById(id)
    } catch {
      error.value = 'Erro ao carregar item'
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: CreateInventoryItem): Promise<InventoryItem> {
    loading.value = true
    error.value = null
    try {
      const item = await inventoryService.create(data)
      items.value.unshift(item)
      return item
    } catch {
      error.value = 'Erro ao criar item'
      throw new Error('Erro ao criar item')
    } finally {
      loading.value = false
    }
  }

  async function updateItem(
    id: string,
    data: Partial<CreateInventoryItem>,
  ): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const updated = await inventoryService.update(id, data)
      const index = items.value.findIndex((i) => i.id === id)
      if (index !== -1) {
        items.value[index] = updated
      }
      if (currentItem.value?.id === id) {
        currentItem.value = updated
      }
    } catch {
      error.value = 'Erro ao atualizar item'
      throw new Error('Erro ao atualizar item')
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await inventoryService.delete(id)
      items.value = items.value.filter((i) => i.id !== id)
    } catch {
      error.value = 'Erro ao excluir item'
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    currentItem,
    loading,
    error,
    total,
    page,
    hasMore,
    filters,
    lowStockItems,
    activeItems,
    ingredientItems,
    packagingItems,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
  }
})
