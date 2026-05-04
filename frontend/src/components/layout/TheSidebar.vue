<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const authStore = useAuthStore()

interface NavItem {
  name: string
  path: string
  icon: string
  adminOnly?: boolean
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: 'grid' },
  { name: 'Inventario', path: '/inventory', icon: 'package' },
  { name: 'Receitas', path: '/recipes', icon: 'book-open' },
  { name: 'Produtos', path: '/products', icon: 'tag' },
  { name: 'Producao', path: '/production', icon: 'activity' },
  { name: 'Lista de Compras', path: '/shopping', icon: 'shopping-cart' },
  { name: 'Relatorios', path: '/reports', icon: 'bar-chart-2' },
  { name: 'Admin', path: '/admin', icon: 'settings', adminOnly: true },
]

const filteredNavigation = computed(() =>
  navigation.filter((item) => !item.adminOnly || authStore.isAdmin),
)

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="emit('close')"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">SB</span>
        </div>
        <span class="text-lg font-bold text-gray-900">Sweet Bites</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in filteredNavigation"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive(item.path)
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ]"
        @click="emit('close')"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <!-- Dashboard -->
          <template v-if="item.icon === 'grid'">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </template>
          <!-- Inventory -->
          <template v-else-if="item.icon === 'package'">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </template>
          <!-- Recipes -->
          <template v-else-if="item.icon === 'book-open'">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </template>
          <!-- Products -->
          <template v-else-if="item.icon === 'tag'">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </template>
          <!-- Production -->
          <template v-else-if="item.icon === 'activity'">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
          </template>
          <!-- Shopping -->
          <template v-else-if="item.icon === 'shopping-cart'">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </template>
          <!-- Reports -->
          <template v-else-if="item.icon === 'bar-chart-2'">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </template>
          <!-- Admin -->
          <template v-else-if="item.icon === 'settings'">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </template>
        </svg>
        {{ item.name }}
      </router-link>
    </nav>

    <!-- User info -->
    <div class="p-4 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-700 font-medium text-xs">
            {{ authStore.user?.displayName?.charAt(0)?.toUpperCase() ?? '?' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.user?.displayName ?? 'Usuario' }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ authStore.user?.email ?? '' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
