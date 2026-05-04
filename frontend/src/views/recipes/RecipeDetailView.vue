<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe.store'
import PageHeader from '@/components/common/PageHeader.vue'
import { formatCurrency } from '@/utils/currency'

const router = useRouter()
const route = useRoute()
const recipeStore = useRecipeStore()

const recipeId = route.params.id as string

onMounted(async () => {
  await recipeStore.fetchRecipe(recipeId)
})
</script>

<template>
  <div>
    <PageHeader
      :title="recipeStore.currentRecipe?.name ?? 'Carregando...'"
      :subtitle="recipeStore.currentRecipe?.category"
    >
      <template #actions>
        <button class="btn-secondary" @click="router.push('/recipes')">Voltar</button>
        <button class="btn-primary" @click="router.push(`/recipes/${recipeId}/edit`)">Editar</button>
      </template>
    </PageHeader>

    <!-- Loading -->
    <div v-if="recipeStore.loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
    </div>

    <div v-else-if="recipeStore.currentRecipe" class="max-w-3xl space-y-6">
      <!-- Cost Summary -->
      <div class="card bg-primary-50 border-primary-200">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-sm text-primary-600">Custo Total</p>
            <p class="text-xl font-bold text-primary-900">{{ formatCurrency(recipeStore.currentRecipe.calculatedCostTotal) }}</p>
          </div>
          <div>
            <p class="text-sm text-primary-600">Custo/Unidade</p>
            <p class="text-xl font-bold text-primary-900">{{ formatCurrency(recipeStore.currentRecipe.calculatedCostPerUnit) }}</p>
          </div>
          <div>
            <p class="text-sm text-primary-600">Rendimento</p>
            <p class="text-xl font-bold text-primary-900">
              {{ recipeStore.currentRecipe.yieldValue }}
              {{ recipeStore.currentRecipe.yieldType === 'units' ? 'un' : recipeStore.currentRecipe.yieldUnit }}
            </p>
          </div>
          <div>
            <p class="text-sm text-primary-600">Ingredientes</p>
            <p class="text-xl font-bold text-primary-900">{{ recipeStore.currentRecipe.ingredients.length }}</p>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="recipeStore.currentRecipe.description" class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Descricao</h3>
        <p class="text-gray-600">{{ recipeStore.currentRecipe.description }}</p>
      </div>

      <!-- Ingredients -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ingredientes</h3>
        <div class="space-y-2">
          <div
            v-for="ing in recipeStore.currentRecipe.ingredients"
            :key="ing.inventoryItemId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 bg-primary-500 rounded-full" />
              <span class="font-medium text-gray-900">{{ ing.inventoryItemName }}</span>
              <span class="text-gray-500">{{ ing.quantity }} {{ ing.unit }}</span>
            </div>
            <span class="font-mono text-sm text-gray-600">{{ formatCurrency(ing.costAtSave * ing.quantity) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="recipeStore.currentRecipe.notes" class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Observacoes</h3>
        <p class="text-gray-600 whitespace-pre-line">{{ recipeStore.currentRecipe.notes }}</p>
      </div>
    </div>
  </div>
</template>
