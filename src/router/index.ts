import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'
import PanelView from '../views/PanelView.vue'
import { me } from '../services/auth'
import { isAuthenticated } from '../services/tokenStorage'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackView,
  },
  {
    path: '/panel',
    name: 'panel',
    component: PanelView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const publicPaths = new Set(['/auth', '/auth/callback'])
let authInitAttempted = false

router.beforeEach(async (to) => {
  if (publicPaths.has(to.path)) {
    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  if (!authInitAttempted) {
    authInitAttempted = true
    try {
      await me()
      return true
    } catch {
      return { path: '/auth' }
    }
  }

  if (isAuthenticated()) {
    return true
  }

  return { path: '/auth' }
})

export default router
