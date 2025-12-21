import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'
import PanelView from '../views/PanelView.vue'

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
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
