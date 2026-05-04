import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/pending-approval',
    name: 'pending-approval',
    component: () => import('@/views/auth/PendingApprovalView.vue'),
    meta: { requiresAuth: true, requiresApproval: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true, requiresApproval: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: () => import('@/views/inventory/InventoryListView.vue'),
      },
      {
        path: 'inventory/new',
        name: 'inventory-new',
        component: () => import('@/views/inventory/InventoryFormView.vue'),
      },
      {
        path: 'inventory/:id/edit',
        name: 'inventory-edit',
        component: () => import('@/views/inventory/InventoryFormView.vue'),
        props: true,
      },
      {
        path: 'recipes',
        name: 'recipes',
        component: () => import('@/views/recipes/RecipeListView.vue'),
      },
      {
        path: 'recipes/new',
        name: 'recipe-new',
        component: () => import('@/views/recipes/RecipeFormView.vue'),
      },
      {
        path: 'recipes/:id',
        name: 'recipe-detail',
        component: () => import('@/views/recipes/RecipeDetailView.vue'),
        props: true,
      },
      {
        path: 'recipes/:id/edit',
        name: 'recipe-edit',
        component: () => import('@/views/recipes/RecipeFormView.vue'),
        props: true,
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/ProductListView.vue'),
      },
      {
        path: 'production',
        name: 'production',
        component: () => import('@/views/production/ProductionView.vue'),
      },
      {
        path: 'shopping',
        name: 'shopping',
        component: () => import('@/views/shopping/ShoppingListView.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/reports/ReportsView.vue'),
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/admin/AdminView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const requiresApproval = to.meta.requiresApproval === true
  const requiresAdmin = to.meta.requiresAdmin === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (!requiresAuth && authStore.isAuthenticated) {
    if (authStore.isPending) {
      return to.name === 'pending-approval' ? true : { name: 'pending-approval' }
    }
    return { name: 'dashboard' }
  }

  if (requiresApproval && authStore.isPending) {
    return { name: 'pending-approval' }
  }

  if (requiresAdmin && !authStore.isAdmin) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
