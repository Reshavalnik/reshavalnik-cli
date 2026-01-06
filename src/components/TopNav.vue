<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { loggedIn, resetSessionState } from '../services/auth'
import { useStudentMathematicsStore } from '../stores/studentMathematics'
import http from '../services/http'
import { clear } from '../services/tokenStorage'

const router = useRouter()
const studentStore = useStudentMathematicsStore()
const { hasResult } = storeToRefs(studentStore)
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
  if (hasResult.value) {
    studentStore.reset()
  }
  await router.push('/auth')
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
