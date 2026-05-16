<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout(): Promise<void> {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="w-full max-w-md text-center">
      <div class="card">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 class="text-xl font-semibold text-gray-900 mb-2">Conta Pendente</h2>
        <p class="text-gray-500 mb-6">
          Sua conta foi criada com sucesso e esta aguardando aprovacao do administrador.
          Voce sera notificado quando sua conta for ativada.
        </p>

        <button class="btn-secondary" @click="handleLogout">
          Voltar para Login
        </button>
      </div>
    </div>
  </div>
</template>
