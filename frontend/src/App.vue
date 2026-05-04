<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center bg-primary-50">
    <div class="text-center">
      <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
      <p class="text-primary-700 font-medium">Carregando Sweet Bites...</p>
    </div>
  </div>
  <router-view v-else />
</template>
