<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loggedIn, refreshSession, resetSessionState } from '../services/auth'
import http from '../services/http'
import { clear } from '../services/tokenStorage'

const router = useRouter()
const route = useRoute()
const syncAuthState = async (): Promise<void> => {
  const isAuthRoute = route.path.startsWith('/auth') || route.path.startsWith('/login')
  if (isAuthRoute) {
    return
  }
  await refreshSession()
}

onMounted(() => {
  void syncAuthState()
})

watch(
  () => route.fullPath,
  () => {
    void syncAuthState()
  },
)

const handleLogin = async (): Promise<void> => {
  await router.push('/login')
}

const handleLogout = async (event?: MouseEvent): Promise<void> => {
  event?.preventDefault()
  await http.post('/auth/logout', null, { withCredentials: true })
  clear()
  resetSessionState()
  await router.push('/login')
}

const goToHome = async (): Promise<void> => {
  const authHome = route.path.startsWith('/auth') || route.path.startsWith('/login')
  await router.push(authHome ? '/auth' : '/login')
}

const goToMathematics = async (event?: MouseEvent): Promise<void> => {
  event?.preventDefault()
  if (!loggedIn.value) {
    return
  }
  await router.push('/student-mathematics')
}
</script>

<template>
  <nav class="auth-mosaic-nav" aria-label="Top navigation">
    <div class="auth-mosaic-nav__pill">
      <button type="button" class="auth-mosaic-nav__item" @click="goToHome">Home</button>
      <button
        type="button"
        class="auth-mosaic-nav__item"
        :class="{ 'auth-mosaic-nav__item--disabled': !loggedIn }"
        :disabled="!loggedIn"
        @click="goToMathematics"
      >
        Mathematics
      </button>
      <button 
        type="button" 
        class="auth-mosaic-nav__item auth-mosaic-nav__item--active"
        @click="loggedIn ? handleLogout() : handleLogin()"
      >
        {{ loggedIn ? 'Logout' : 'Login' }}
      </button>
    </div>
  </nav>
</template>
