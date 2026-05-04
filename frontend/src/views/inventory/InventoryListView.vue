<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory.store'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatCurrency } from '@/utils/currency'
import { getUnitLabel } from '@/utils/units'
import type { ItemCategory } from '@/types'

const router = useRouter()
const inventoryStore = useInventoryStore()

const search = ref('')
const categoryFilter = ref<ItemCategory | ''>('')
const statusFilter = ref<'active' | 'inactive' | ''>('')

let searchTimeout: ReturnType<typeof setTimeout>

function handleSearch(): void {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    inventoryStore.fetchItems({
      search: search.value || undefined,
      category: categoryFilter.value || undefined,
      status: statusFilter.value || undefined,
      page: 1,
    })
  }, 300)
}

watch([categoryFilter, statusFilter], () => {
  inventoryStore.fetchItems({
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    status: statusFilter.value || undefined,
    page: 1,
  })
})

onMounted(() => {
  inventoryStore.fetchItems()
})

function getStockStatus(item: { currentQuantity: number; minimumQuantity: number }): { label: string; class: string } {
  if (item.currentQuantity <= 0) {
    return { label: 'Sem estoque', class: 'badge-danger' }
  }
  if (item.currentQuantity <= item.minimumQuantity) {
    return { label: 'Estoque baixo', class: 'badge-danger' }
  }
  if (item.currentQuantity <= item.minimumQuantity * 1.2) {
    return { label: 'Atencao', class: 'badge-warning' }
  }
  return { label: 'Normal', class: 'badge-success' }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ingredient: 'Insumo',
    packaging: 'Embalagem',
    other: 'Outro',
  }
  return labels[category] ?? category
}
</script>

<template>
  <div>
    <PageHeader title="Inventario" subtitle="Gerencie seus insumos e embalagens">
      <template #actions>
        <button class="btn-primary" @click="router.push('/inventory/new')">
          + Novo Item
        </button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            class="input-field"
            placeholder="Buscar por nome..."
            @input="handleSearch"
          />
        </div>
        <select v-model="categoryFilter" class="input-field md:w-48">
          <option value="">Todas as categorias</option>
          <option value="ingredient">Insumos</option>
          <option value="packaging">Embalagens</option>
          <option value="other">Outros</option>
        </select>
        <select v-model="statusFilter" class="input-field md:w-40">
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="inventoryStore.loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="inventoryStore.items.length === 0"
      title="Nenhum item encontrado"
      description="Comece adicionando seus primeiros insumos e embalagens."
    >
      <button class="btn-primary" @click="router.push('/inventory/new')">
        + Adicionar Primeiro Item
      </button>
    </EmptyState>

    <!-- Table (Desktop) -->
    <div v-else class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-header px-6 py-3">Nome</th>
              <th class="table-header px-6 py-3">Categoria</th>
              <th class="table-header px-6 py-3 text-right">Qtd. Atual</th>
              <th class="table-header px-6 py-3">Unidade</th>
              <th class="table-header px-6 py-3 text-right">Custo</th>
              <th class="table-header px-6 py-3">Status</th>
              <th class="table-header px-6 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in inventoryStore.items"
              :key="item.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-gray-900">{{ item.name }}</p>
                <p v-if="item.supplier" class="text-xs text-gray-500">{{ item.supplier }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="badge-gray">{{ getCategoryLabel(item.category) }}</span>
              </td>
              <td class="px-6 py-4 text-right font-mono">{{ item.currentQuantity }}</td>
              <td class="px-6 py-4 text-gray-500">{{ getUnitLabel(item.baseUnit) }}</td>
              <td class="px-6 py-4 text-right font-mono">
                {{ formatCurrency(item.lastPurchasePrice) }}/{{ item.baseUnit }}
              </td>
              <td class="px-6 py-4">
                <span :class="getStockStatus(item).class">
                  {{ getStockStatus(item).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="btn-ghost btn-sm"
                  @click="router.push(`/inventory/${item.id}/edit`)"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
