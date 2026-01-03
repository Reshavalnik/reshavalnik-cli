import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'
import PanelView from '../views/PanelView.vue'
import StudentMathematic from '../views/StudentMathematic.vue'
import { me } from '../services/auth'
import { isAuthenticated } from '../services/tokenStorage'
import { logAuthState, logRouteChange } from '../dev/runtimeDiagnostics'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
  },
  {
    path: '/login',
    name: 'login',
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
  {
    path: '/student-mathematic',
    name: 'student-mathematic',
    component: StudentMathematic,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const publicPaths = new Set(['/auth', '/auth/callback', '/login'])
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
      return { path: '/login' }
    }
  }

  if (isAuthenticated()) {
    return true
  }

  return { path: '/login' }
})

if (import.meta.env.DEV) {
  router.afterEach((to, from) => {
    logRouteChange(to, from)
    logAuthState('afterEach')
  })
}

export default router
