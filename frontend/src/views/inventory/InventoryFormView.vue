<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory.store'
import PageHeader from '@/components/common/PageHeader.vue'
import type { CreateInventoryItem, ItemCategory, BaseUnit } from '@/types'

const router = useRouter()
const route = useRoute()
const inventoryStore = useInventoryStore()

const itemId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!itemId.value)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = ref<CreateInventoryItem>({
  name: '',
  category: 'ingredient',
  baseUnit: 'g',
  currentQuantity: 0,
  minimumQuantity: 0,
  lastPurchasePrice: 0,
  supplier: '',
  notes: '',
})

const categoryOptions: { value: ItemCategory; label: string }[] = [
  { value: 'ingredient', label: 'Insumo' },
  { value: 'packaging', label: 'Embalagem' },
  { value: 'other', label: 'Outro' },
]

const unitOptions: { value: BaseUnit; label: string }[] = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'un', label: 'Unidades (un)' },
]

onMounted(async () => {
  if (isEditing.value && itemId.value) {
    await inventoryStore.fetchItem(itemId.value)
    if (inventoryStore.currentItem) {
      const item = inventoryStore.currentItem
      form.value = {
        name: item.name,
        category: item.category,
        baseUnit: item.baseUnit,
        currentQuantity: item.currentQuantity,
        minimumQuantity: item.minimumQuantity,
        lastPurchasePrice: item.lastPurchasePrice,
        supplier: item.supplier ?? '',
        notes: item.notes ?? '',
      }
    }
  }
})

async function handleSubmit(): Promise<void> {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    if (isEditing.value && itemId.value) {
      await inventoryStore.updateItem(itemId.value, form.value)
      successMsg.value = 'Item atualizado com sucesso!'
    } else {
      await inventoryStore.createItem(form.value)
      successMsg.value = 'Item criado com sucesso!'
    }
    setTimeout(() => router.push('/inventory'), 1000)
  } catch {
    errorMsg.value = 'Erro ao salvar item. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="isEditing ? 'Editar Item' : 'Novo Item'"
      :subtitle="isEditing ? 'Atualize os dados do item' : 'Adicione um novo insumo ou embalagem'"
    >
      <template #actions>
        <button class="btn-secondary" @click="router.push('/inventory')">
          Voltar
        </button>
      </template>
    </PageHeader>

    <div class="card max-w-2xl">
      <div v-if="errorMsg" class="mb-4 p-3 bg-danger-50 border border-danger-500 rounded-lg text-danger-700 text-sm">
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="mb-4 p-3 bg-success-50 border border-success-500 rounded-lg text-success-700 text-sm">
        {{ successMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name -->
        <div>
          <label class="label" for="name">Nome *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="input-field"
            placeholder="Ex: Leite Condensado"
            required
          />
        </div>

        <!-- Category & Unit -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label" for="category">Categoria *</label>
            <select id="category" v-model="form.category" class="input-field">
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="label" for="baseUnit">Unidade Base *</label>
            <select id="baseUnit" v-model="form.baseUnit" class="input-field">
              <option v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Quantities -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label" for="currentQty">Quantidade Atual *</label>
            <div class="flex">
              <input
                id="currentQty"
                v-model.number="form.currentQuantity"
                type="number"
                step="0.01"
                min="0"
                class="input-field rounded-r-none"
                required
              />
              <span class="inline-flex items-center px-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500">
                {{ form.baseUnit }}
              </span>
            </div>
          </div>
          <div>
            <label class="label" for="minQty">Quantidade Minima</label>
            <div class="flex">
              <input
                id="minQty"
                v-model.number="form.minimumQuantity"
                type="number"
                step="0.01"
                min="0"
                class="input-field rounded-r-none"
              />
              <span class="inline-flex items-center px-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500">
                {{ form.baseUnit }}
              </span>
            </div>
          </div>
        </div>

        <!-- Price -->
        <div>
          <label class="label" for="price">Custo (ultima compra)</label>
          <div class="flex">
            <span class="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
              R$
            </span>
            <input
              id="price"
              v-model.number="form.lastPurchasePrice"
              type="number"
              step="0.01"
              min="0"
              class="input-field rounded-l-none"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Preco por {{ form.baseUnit }}</p>
        </div>

        <!-- Supplier -->
        <div>
          <label class="label" for="supplier">Fornecedor</label>
          <input
            id="supplier"
            v-model="form.supplier"
            type="text"
            class="input-field"
            placeholder="Ex: Atacadao, Makro..."
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="label" for="notes">Observacoes</label>
          <textarea
            id="notes"
            v-model="form.notes"
            class="input-field"
            rows="3"
            placeholder="Anotacoes sobre o item..."
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" class="btn-secondary" @click="router.push('/inventory')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {{ isEditing ? 'Salvar Alteracoes' : 'Criar Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
