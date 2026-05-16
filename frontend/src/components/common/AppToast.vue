<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)

watch(
  () => props.message,
  () => {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration ?? 3000)
  },
  { immediate: true },
)

const colorClasses = {
  success: 'bg-success-50 text-success-700 border-success-500',
  error: 'bg-danger-50 text-danger-700 border-danger-500',
  warning: 'bg-primary-50 text-primary-700 border-primary-500',
  info: 'bg-blue-50 text-blue-700 border-blue-500',
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="visible"
      :class="[
        'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border-l-4 shadow-lg max-w-sm',
        colorClasses[type ?? 'info'],
      ]"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium">{{ message }}</p>
        <button
          class="text-current opacity-50 hover:opacity-100"
          @click="visible = false; emit('close')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
