import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'
import PanelView from '../views/PanelView.vue'
import StudentMathematics from '../views/StudentMathematics.vue'
import { loggedIn, refreshSession } from '../services/auth'
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
    path: '/student-mathematics',
    name: 'student-mathematics',
    component: StudentMathematics,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const publicPaths = new Set(['/auth', '/auth/callback', '/login'])

router.beforeEach(async (to) => {
  if (publicPaths.has(to.path)) {
    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  await refreshSession()
  if (loggedIn.value) {
    return true
  }
  if (to.path === '/login') {
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
