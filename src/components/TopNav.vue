<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../services/auth'
import { isAuthenticated } from '../services/tokenStorage'

const router = useRouter()
const authed = computed(() => isAuthenticated())

const handleLogin = async (): Promise<void> => {
  await router.push('/login')
}

const handleLogout = async (): Promise<void> => {
  logout()
  await router.push('/login')
}
</script>

<template>
  <nav class="top-nav">
    <button v-if="!authed" type="button" class="top-nav__action" @click="handleLogin">
      Login
    </button>
    <button v-else type="button" class="top-nav__action" @click="handleLogout">
      Logout
    </button>
  </nav>
</template>
