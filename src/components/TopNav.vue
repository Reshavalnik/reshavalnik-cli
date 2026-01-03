<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '../services/auth'
import { isAuthenticated } from '../services/tokenStorage'

const router = useRouter()
const route = useRoute()
const authed = computed(() => isAuthenticated())

const handleLogin = async (): Promise<void> => {
  await router.push('/login')
}

const handleLogout = async (): Promise<void> => {
  logout()
  await router.push('/login')
}

const goToHome = async (): Promise<void> => {
  const authHome = route.path.startsWith('/auth') || route.path.startsWith('/login')
  await router.push(authHome ? '/auth' : '/login')
}

const goToMathematic = async (): Promise<void> => {
  await router.push('/student-mathematic')
}
</script>

<template>
  <nav class="auth-mosaic-nav" aria-label="Top navigation">
    <div class="auth-mosaic-nav__pill">
      <button type="button" class="auth-mosaic-nav__item" @click="goToHome">Home</button>
      <button type="button" class="auth-mosaic-nav__item" @click="goToMathematic">Mathematic</button>
      <button 
        type="button" 
        class="auth-mosaic-nav__item auth-mosaic-nav__item--active"
        @click="authed ? handleLogout() : handleLogin()"
      >
        {{ authed ? 'Logout' : 'Login' }}
      </button>
    </div>
  </nav>
</template>
