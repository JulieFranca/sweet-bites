<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import { useInventoryStore } from '@/stores/inventory.store'
import { formatCurrency } from '@/utils/currency'

const router = useRouter()
const inventoryStore = useInventoryStore()

const stats = ref({
  totalItems: 0,
  lowStockItems: 0,
  productionsThisMonth: 0,
  totalCostThisMonth: 0,
})

onMounted(async () => {
  await inventoryStore.fetchItems()
  stats.value.totalItems = inventoryStore.activeItems.length
  stats.value.lowStockItems = inventoryStore.lowStockItems.length
})

interface StatCard {
  label: string
  value: string
  color: string
  icon: string
}

const statCards = ref<StatCard[]>([])

onMounted(() => {
  statCards.value = [
    {
      label: 'Itens no Inventario',
      value: String(stats.value.totalItems),
      color: 'bg-blue-500',
      icon: 'package',
    },
    {
      label: 'Estoque Baixo',
      value: String(stats.value.lowStockItems),
      color: stats.value.lowStockItems > 0 ? 'bg-danger-500' : 'bg-success-500',
      icon: 'alert',
    },
    {
      label: 'Producoes este Mes',
      value: String(stats.value.productionsThisMonth),
      color: 'bg-primary-500',
      icon: 'activity',
    },
    {
      label: 'Custo Total do Mes',
      value: formatCurrency(stats.value.totalCostThisMonth),
      color: 'bg-purple-500',
      icon: 'dollar',
    },
  ]
})

interface QuickAction {
  label: string
  path: string
  color: string
}

const quickActions: QuickAction[] = [
  { label: '+ Inventario', path: '/inventory/new', color: 'btn-primary' },
  { label: '+ Receita', path: '/recipes/new', color: 'btn-secondary' },
  { label: '+ Producao', path: '/production', color: 'btn-secondary' },
]
</script>

<template>
  <div>
    <PageHeader title="Dashboard" subtitle="Visao geral do seu negocio" />

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <div
        v-for="(stat, index) in statCards"
        :key="index"
        class="card flex items-center gap-4"
      >
        <div :class="[stat.color, 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0']">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <template v-if="stat.icon === 'package'">
              <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </template>
            <template v-else-if="stat.icon === 'alert'">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </template>
            <template v-else-if="stat.icon === 'activity'">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </template>
            <template v-else>
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </template>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Acoes Rapidas</h3>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="action in quickActions"
          :key="action.path"
          :class="action.color"
          @click="router.push(action.path)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Low Stock Alerts -->
    <div v-if="inventoryStore.lowStockItems.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Alertas de Estoque</h3>
      <div class="space-y-3">
        <div
          v-for="item in inventoryStore.lowStockItems.slice(0, 5)"
          :key="item.id"
          class="flex items-center justify-between p-3 bg-danger-50 rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-500">
              {{ item.currentQuantity }} {{ item.baseUnit }} restantes
              (minimo: {{ item.minimumQuantity }} {{ item.baseUnit }})
            </p>
          </div>
          <span class="badge-danger">Estoque Baixo</span>
        </div>
      </div>
    </div>
  </div>
</template>
