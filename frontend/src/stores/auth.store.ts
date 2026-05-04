import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { User } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const firebaseUser = ref<FirebaseUser | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!firebaseUser.value)
  const isActive = computed(() => user.value?.status === 'active')
  const isAdmin = computed(() => user.value?.isAdmin === true)
  const isPending = computed(() => user.value?.status === 'pending_approval')

  async function login(email: string, password: string): Promise<void> {
    error.value = null
    loading.value = true
    try {
      await authService.login(email, password)
    } catch (err) {
      error.value = 'Email ou senha incorretos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> {
    error.value = null
    loading.value = true
    try {
      await authService.register(email, password, displayName)
    } catch (err) {
      error.value = 'Erro ao criar conta. Tente novamente.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    await authService.logout()
    user.value = null
    firebaseUser.value = null
  }

  async function fetchProfile(): Promise<void> {
    try {
      user.value = await authService.getProfile()
    } catch {
      user.value = null
    }
  }

  function initAuthListener(): void {
    authService.onAuthChanged(async (fbUser) => {
      firebaseUser.value = fbUser
      if (fbUser) {
        await fetchProfile()
      } else {
        user.value = null
      }
      loading.value = false
    })
  }

  return {
    firebaseUser,
    user,
    loading,
    error,
    isAuthenticated,
    isActive,
    isAdmin,
    isPending,
    login,
    register,
    logout,
    fetchProfile,
    initAuthListener,
  }
})
