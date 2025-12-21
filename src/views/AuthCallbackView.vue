<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { me } from '../services/auth'
import { clear, setAccessToken } from '../services/tokenStorage'

const router = useRouter()
const errorMessage = ref<string | null>(null)

const getTokenFromHash = (hash: string): string | null => {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  if (!fragment) {
    return null
  }
  const params = new URLSearchParams(fragment)
  return params.get('access_token')
}

const getTokenFromQuery = (): string | null => {
  const params = new URLSearchParams(window.location.search)
  return params.get('access_token') || params.get('token')
}

onMounted(async () => {
  const tokenFromQuery = getTokenFromQuery()
  const tokenFromHash = getTokenFromHash(window.location.hash)
  const token = tokenFromQuery || tokenFromHash

  if (token) {
    setAccessToken(token)
    await router.replace('/panel')
    return
  }

  try {
    await me()
    await router.replace('/panel')
  } catch {
    errorMessage.value = 'Authentication failed. Redirecting to login...'
    clear()
    await router.replace('/auth')
  }
})
</script>

<template>
  <div class="auth-callback-view">
    <div v-if="errorMessage">
      {{ errorMessage }}
    </div>
    <div v-else>
      Signing you in...
    </div>
  </div>
</template>
