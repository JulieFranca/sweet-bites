<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister(): Promise<void> {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas nao coincidem.'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  loading.value = true
  try {
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/pending-approval')
  } catch {
    errorMsg.value = 'Erro ao criar conta. O email ja pode estar em uso.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white font-bold text-2xl">SB</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Sweet Bites</h1>
        <p class="text-gray-500 mt-1">Crie sua conta</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Criar Conta</h2>

        <div v-if="errorMsg" class="mb-4 p-3 bg-danger-50 border border-danger-500 rounded-lg text-danger-700 text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="label" for="name">Nome completo</label>
            <input
              id="name"
              v-model="displayName"
              type="text"
              class="input-field"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label class="label" for="reg-email">Email</label>
            <input
              id="reg-email"
              v-model="email"
              type="email"
              class="input-field"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="label" for="reg-password">Senha</label>
            <input
              id="reg-password"
              v-model="password"
              type="password"
              class="input-field"
              placeholder="Minimo 6 caracteres"
              required
              autocomplete="new-password"
            />
          </div>

          <div>
            <label class="label" for="confirm-password">Confirmar Senha</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="input-field"
              placeholder="Repita a senha"
              required
              autocomplete="new-password"
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {{ loading ? 'Criando conta...' : 'Criar Conta' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Ja tem conta?
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Entrar
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
