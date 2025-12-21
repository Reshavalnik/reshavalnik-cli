<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signin, signup, getGoogleLoginUrl, getFacebookLoginUrl } from '../services/auth'
import { setAccessToken } from '../services/tokenStorage'

type Mode = 'login' | 'register'

const router = useRouter()
const mode = ref<Mode>('login')
const errorMessage = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
})

const setMode = (next: Mode): void => {
  mode.value = next
  errorMessage.value = null
}

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null
  try {
    const response = mode.value === 'login' ? await signin(form) : await signup(form)
    const token = (response as Record<string, unknown>).accessToken ?? (response as Record<string, unknown>).token
    if (typeof token === 'string' && token.length > 0) {
      setAccessToken(token)
    }
    await router.push('/panel')
  } catch {
    errorMessage.value = 'Authentication failed. Please try again.'
  }
}

const loginWithGoogle = (): void => {
  window.location.href = getGoogleLoginUrl()
}

const loginWithFaceBook = (): void => {
  window.location.href = getFacebookLoginUrl()
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-view__tabs">
      <button type="button" class="auth-view__tab" @click="setMode('login')">
        Login
      </button>
      <button type="button" class="auth-view__tab" @click="setMode('register')">
        Register
      </button>
    </div>

    <form class="auth-view__form" @submit.prevent="handleSubmit">
      <label class="auth-view__field">
        <span class="auth-view__label">Email</span>
        <input v-model="form.email" type="email" class="auth-view__input" autocomplete="email" />
      </label>
      <label class="auth-view__field">
        <span class="auth-view__label">Password</span>
        <input
          v-model="form.password"
          type="password"
          class="auth-view__input"
          autocomplete="current-password"
        />
      </label>

      <div v-if="errorMessage" class="auth-view__error">
        {{ errorMessage }}
      </div>

      <button type="submit" class="auth-view__submit">
        {{ mode === 'login' ? 'Login' : 'Register' }}
      </button>
    </form>

    <div class="auth-view__social">
      <button type="button" class="auth-view__social-button" @click="loginWithGoogle">
        Continue with Google
      </button>
      <button type="button" class="auth-view__social-button" @click="loginWithFaceBook">
        Continue with Facebook
      </button>
    </div>
  </div>
</template>
