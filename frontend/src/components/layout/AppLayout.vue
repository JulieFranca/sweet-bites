<script setup lang="ts">
import { ref } from 'vue'
import TheSidebar from './TheSidebar.vue'
import TheTopbar from './TheTopbar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <TheSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="lg:pl-64">
      <TheTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="py-6 px-4 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
