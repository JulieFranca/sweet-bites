<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin(): Promise<void> {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch {
    errorMsg.value = 'Email ou senha incorretos. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white font-bold text-2xl">SB</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Sweet Bites</h1>
        <p class="text-gray-500 mt-1">Sistema de Gestao para Confeitaria</p>
      </div>

      <!-- Form -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Entrar</h2>

        <div v-if="errorMsg" class="mb-4 p-3 bg-danger-50 border border-danger-500 rounded-lg text-danger-700 text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="label" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="input-field"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="label" for="password">Senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="input-field"
              placeholder="Sua senha"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Nao tem conta?
          <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Criar conta
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
