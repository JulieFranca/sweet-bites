<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe.store'
import { useInventoryStore } from '@/stores/inventory.store'
import PageHeader from '@/components/common/PageHeader.vue'
import { formatCurrency } from '@/utils/currency'
import { MEASURE_OPTIONS } from '@/utils/units'
import type { RecipeIngredient } from '@/types'

const router = useRouter()
const route = useRoute()
const recipeStore = useRecipeStore()
const inventoryStore = useInventoryStore()

const recipeId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!recipeId.value)
const loading = ref(false)
const errorMsg = ref('')

const name = ref('')
const description = ref('')
const category = ref('')
const yieldType = ref<'units' | 'weight'>('units')
const yieldValue = ref(1)
const yieldUnit = ref('g')
const prepTimeMinutes = ref<number | undefined>()
const notes = ref('')

const ingredients = ref<(RecipeIngredient & { editing?: boolean })[]>([])

const newIngredient = ref({
  inventoryItemId: '',
  quantity: 1,
  unit: 'g',
})

const totalCost = computed(() => {
  return ingredients.value.reduce((sum, ing) => sum + (ing.costAtSave * ing.quantity), 0)
})

const costPerUnit = computed(() => {
  if (yieldValue.value <= 0) return 0
  return totalCost.value / yieldValue.value
})

onMounted(async () => {
  await inventoryStore.fetchItems({ pageSize: 200 })

  if (isEditing.value && recipeId.value) {
    await recipeStore.fetchRecipe(recipeId.value)
    if (recipeStore.currentRecipe) {
      const r = recipeStore.currentRecipe
      name.value = r.name
      description.value = r.description ?? ''
      category.value = r.category
      yieldType.value = r.yieldType
      yieldValue.value = r.yieldValue
      yieldUnit.value = r.yieldUnit ?? 'g'
      prepTimeMinutes.value = r.prepTimeMinutes
      notes.value = r.notes ?? ''
      ingredients.value = [...r.ingredients]
    }
  }
})

function addIngredient(): void {
  const item = inventoryStore.activeItems.find(
    (i) => i.id === newIngredient.value.inventoryItemId,
  )
  if (!item) return

  ingredients.value.push({
    inventoryItemId: item.id,
    inventoryItemName: item.name,
    quantity: newIngredient.value.quantity,
    unit: newIngredient.value.unit,
    unitInGrams: 1,
    costAtSave: item.lastPurchasePrice,
  })

  newIngredient.value = { inventoryItemId: '', quantity: 1, unit: 'g' }
}

function removeIngredient(index: number): void {
  ingredients.value.splice(index, 1)
}

async function handleSubmit(): Promise<void> {
  if (ingredients.value.length === 0) {
    errorMsg.value = 'Adicione pelo menos um ingrediente.'
    return
  }

  errorMsg.value = ''
  loading.value = true

  try {
    const data = {
      name: name.value,
      description: description.value || undefined,
      category: category.value,
      ingredients: ingredients.value.map((ing) => ({
        inventoryItemId: ing.inventoryItemId,
        inventoryItemName: ing.inventoryItemName,
        quantity: ing.quantity,
        unit: ing.unit,
        unitInGrams: ing.unitInGrams,
        costAtSave: ing.costAtSave,
      })),
      yieldType: yieldType.value,
      yieldValue: yieldValue.value,
      yieldUnit: yieldType.value === 'weight' ? yieldUnit.value : undefined,
      prepTimeMinutes: prepTimeMinutes.value,
      notes: notes.value || undefined,
    }

    if (isEditing.value && recipeId.value) {
      await recipeStore.updateRecipe(recipeId.value, data)
    } else {
      await recipeStore.createRecipe(data)
    }
    router.push('/recipes')
  } catch {
    errorMsg.value = 'Erro ao salvar receita.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="isEditing ? 'Editar Receita' : 'Nova Receita'"
      :subtitle="isEditing ? 'Atualize sua receita' : 'Crie uma nova receita com custo calculado'"
    >
      <template #actions>
        <button class="btn-secondary" @click="router.push('/recipes')">Voltar</button>
      </template>
    </PageHeader>

    <div class="max-w-3xl space-y-6">
      <div v-if="errorMsg" class="p-3 bg-danger-50 border border-danger-500 rounded-lg text-danger-700 text-sm">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Info -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informacoes Basicas</h3>
          <div class="space-y-4">
            <div>
              <label class="label" for="recipeName">Nome da Receita *</label>
              <input id="recipeName" v-model="name" type="text" class="input-field" placeholder="Ex: Brigadeiro Tradicional" required />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label" for="recipeCategory">Categoria *</label>
                <input id="recipeCategory" v-model="category" type="text" class="input-field" placeholder="Ex: brigadeiros, bolos..." required />
              </div>
              <div>
                <label class="label" for="prepTime">Tempo de Preparo (min)</label>
                <input id="prepTime" v-model.number="prepTimeMinutes" type="number" class="input-field" min="1" />
              </div>
            </div>
            <div>
              <label class="label" for="recipeDesc">Descricao</label>
              <textarea id="recipeDesc" v-model="description" class="input-field" rows="2" />
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Ingredientes</h3>

          <!-- Add ingredient row -->
          <div class="flex flex-col md:flex-row gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <select v-model="newIngredient.inventoryItemId" class="input-field md:flex-1">
              <option value="">Selecione um ingrediente...</option>
              <option v-for="item in inventoryStore.ingredientItems" :key="item.id" :value="item.id">
                {{ item.name }} ({{ formatCurrency(item.lastPurchasePrice) }}/{{ item.baseUnit }})
              </option>
            </select>
            <input v-model.number="newIngredient.quantity" type="number" step="0.01" min="0.01" class="input-field md:w-24" placeholder="Qtd" />
            <select v-model="newIngredient.unit" class="input-field md:w-40">
              <option v-for="unit in MEASURE_OPTIONS" :key="unit" :value="unit">{{ unit }}</option>
            </select>
            <button type="button" class="btn-primary" :disabled="!newIngredient.inventoryItemId" @click="addIngredient">
              + Adicionar
            </button>
          </div>

          <!-- Ingredient list -->
          <div v-if="ingredients.length === 0" class="text-center py-6 text-gray-400 text-sm">
            Nenhum ingrediente adicionado ainda
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(ing, index) in ingredients"
              :key="index"
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div class="flex items-center gap-3 flex-1">
                <span class="w-2 h-2 bg-primary-500 rounded-full" />
                <span class="font-medium text-gray-900">{{ ing.inventoryItemName }}</span>
                <span class="text-gray-500">{{ ing.quantity }} {{ ing.unit }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-mono text-gray-600">{{ formatCurrency(ing.costAtSave * ing.quantity) }}</span>
                <button type="button" class="text-gray-400 hover:text-danger-500" @click="removeIngredient(index)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-end pt-2 border-t border-gray-200">
              <span class="font-semibold text-gray-900">Custo Total: {{ formatCurrency(totalCost) }}</span>
            </div>
          </div>
        </div>

        <!-- Yield -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Rendimento</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Tipo</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="yieldType" type="radio" value="units" class="text-primary-500" />
                  <span class="text-sm">Unidades</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="yieldType" type="radio" value="weight" class="text-primary-500" />
                  <span class="text-sm">Peso</span>
                </label>
              </div>
            </div>
            <div>
              <label class="label" for="yieldVal">Quantidade</label>
              <div class="flex">
                <input id="yieldVal" v-model.number="yieldValue" type="number" step="1" min="1" class="input-field rounded-r-none" required />
                <span class="inline-flex items-center px-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500">
                  {{ yieldType === 'units' ? 'unidades' : yieldUnit }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cost summary -->
          <div v-if="ingredients.length > 0" class="mt-4 p-4 bg-primary-50 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-primary-600">Custo Total da Receita</p>
                <p class="text-xl font-bold text-primary-900">{{ formatCurrency(totalCost) }}</p>
              </div>
              <div>
                <p class="text-sm text-primary-600">Custo por Unidade</p>
                <p class="text-xl font-bold text-primary-900">{{ formatCurrency(costPerUnit) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card">
          <label class="label" for="recipeNotes">Observacoes</label>
          <textarea id="recipeNotes" v-model="notes" class="input-field" rows="3" placeholder="Modo de preparo, dicas..." />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" @click="router.push('/recipes')">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {{ isEditing ? 'Salvar Alteracoes' : 'Criar Receita' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
