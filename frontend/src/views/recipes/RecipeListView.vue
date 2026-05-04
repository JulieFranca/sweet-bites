<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe.store'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatCurrency } from '@/utils/currency'

const router = useRouter()
const recipeStore = useRecipeStore()

const search = ref('')
const categoryFilter = ref('')

let searchTimeout: ReturnType<typeof setTimeout>

function handleSearch(): void {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    recipeStore.fetchRecipes({
      search: search.value || undefined,
      category: categoryFilter.value || undefined,
      page: 1,
    })
  }, 300)
}

watch(categoryFilter, () => {
  recipeStore.fetchRecipes({
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    page: 1,
  })
})

onMounted(() => {
  recipeStore.fetchRecipes()
})
</script>

<template>
  <div>
    <PageHeader title="Receitas" subtitle="Gerencie suas receitas e custos">
      <template #actions>
        <button class="btn-primary" @click="router.push('/recipes/new')">
          + Nova Receita
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
            placeholder="Buscar receita..."
            @input="handleSearch"
          />
        </div>
        <select v-model="categoryFilter" class="input-field md:w-48">
          <option value="">Todas as categorias</option>
          <option value="trufas">Trufas</option>
          <option value="bolos">Bolos</option>
          <option value="brigadeiros">Brigadeiros</option>
          <option value="doces">Doces</option>
          <option value="salgados">Salgados</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="recipeStore.loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="recipeStore.recipes.length === 0"
      title="Nenhuma receita encontrada"
      description="Comece criando sua primeira receita."
    >
      <button class="btn-primary" @click="router.push('/recipes/new')">
        + Criar Primeira Receita
      </button>
    </EmptyState>

    <!-- Recipe Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="recipe in recipeStore.recipes"
        :key="recipe.id"
        class="card hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push(`/recipes/${recipe.id}`)"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ recipe.name }}</h3>
            <span class="badge-gray mt-1">{{ recipe.category }}</span>
          </div>
        </div>

        <p v-if="recipe.description" class="text-sm text-gray-500 mb-3 line-clamp-2">
          {{ recipe.description }}
        </p>

        <div class="border-t border-gray-100 pt-3 mt-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-gray-500">Custo Total</p>
              <p class="font-semibold text-gray-900">{{ formatCurrency(recipe.calculatedCostTotal) }}</p>
            </div>
            <div>
              <p class="text-gray-500">Custo/Unidade</p>
              <p class="font-semibold text-gray-900">{{ formatCurrency(recipe.calculatedCostPerUnit) }}</p>
            </div>
            <div>
              <p class="text-gray-500">Rendimento</p>
              <p class="font-semibold text-gray-900">{{ recipe.yieldValue }} {{ recipe.yieldType === 'units' ? 'un' : recipe.yieldUnit }}</p>
            </div>
            <div>
              <p class="text-gray-500">Ingredientes</p>
              <p class="font-semibold text-gray-900">{{ recipe.ingredients.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
