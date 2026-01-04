<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signin, signup, getGoogleLoginUrl, getFacebookLoginUrl } from '../services/auth'
import { setAccessToken } from '../services/tokenStorage'
import TopNav from '../components/TopNav.vue'

type Mode = 'login' | 'register'

const router = useRouter()
const mode = ref<Mode>('login')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const passwordVisible = ref(false)

const setMode = (next: Mode): void => {
  mode.value = next
  errorMessage.value = null
}

const handleLogin = async (): Promise<void> => {
  if (isSubmitting.value) {
    return
  }
  errorMessage.value = null
  isSubmitting.value = true
  try {
    const response = await signin(form)
    const token = (response as Record<string, unknown>).accessToken ?? (response as Record<string, unknown>).token
    if (typeof token === 'string' && token.length > 0) {
      setAccessToken(token)
    }
    await router.push('/student-mathematics')
  } catch {
    errorMessage.value = 'Authentication failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSignup = async (): Promise<void> => {
  if (isSubmitting.value) {
    return
  }
  errorMessage.value = null
  if (!form.username || !form.email || !form.password) {
    errorMessage.value = 'Please fill out all fields.'
    return
  }
  isSubmitting.value = true
  try {
    const response = await signup(form)
    const token = (response as Record<string, unknown>).accessToken ?? (response as Record<string, unknown>).token
    if (typeof token === 'string' && token.length > 0) {
      setAccessToken(token)
    }
    await router.push('/student-mathematics')
  } catch {
    errorMessage.value = 'Authentication failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const loginWithGoogle = (): void => {
  window.location.assign(getGoogleLoginUrl())
}

const loginWithFaceBook = (): void => {
  window.location.assign(getFacebookLoginUrl())
}

const togglePasswordVisible = (): void => {
  passwordVisible.value = !passwordVisible.value
}

</script>

<template>
  <div class="auth-page" style="grid-template-columns: 1fr 2fr;">
    <section class="form-wrap">
      <div class="container">
        <div class="brand-chip">Reshavalnik</div>
        <h1 class="title">{{ mode === 'register' ? 'Sign up account' : 'Welcome back' }}</h1>
        <p class="subtitle">
          {{ mode === 'register' ? 'Enter your personal data to create your account' : 'Log in with your account credentials' }}
        </p>

        <div class="auth-toggle">
          <button
            type="button"
            class="btn btn-pill btn-outline"
            :class="{ 'is-active': mode === 'login' }"
            @click="setMode('login')"
          >
            Log in
          </button>
          <button
            type="button"
            class="btn btn-pill btn-outline"
            :class="{ 'is-active': mode === 'register' }"
            @click="setMode('register')"
          >
            Sign up
          </button>
        </div>

        <div class="oauth">
          <button class="btn btn-pill btn-outline" type="button" aria-label="Continue with Google" @click="loginWithGoogle">
            <img
              src="data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='20' height='20'>
                  <path fill='%23EA4335' d='M24 9.5c3.54 0 6.7 1.22 9.18 3.22l6.84-6.84C35.9 2.36 30.28 0 24 0 14.64 0 6.6 5.38 2.7 13.22l7.98 6.2C12.56 13.16 17.86 9.5 24 9.5z'/>
                  <path fill='%234285F4' d='M46.1 24.5c0-1.6-.14-3.14-.4-4.64H24v9h12.5c-.54 2.9-2.18 5.36-4.64 7.04l7.1 5.52C43.98 37.36 46.1 31.4 46.1 24.5z'/>
                  <path fill='%23FBBC05' d='M10.68 28.42c-.48-1.44-.76-2.98-.76-4.42s.28-2.98.76-4.42l-7.98-6.2C.98 16.3 0 20.04 0 24s.98 7.7 2.7 10.62l7.98-6.2z'/>
                  <path fill='%2334A853' d='M24 48c6.28 0 11.9-2.06 15.86-5.58l-7.1-5.52c-1.98 1.34-4.52 2.14-8.76 2.14-6.14 0-11.44-3.66-13.32-8.92l-7.98 6.2C6.6 42.62 14.64 48 24 48z'/>
                </svg>"
              alt=""
            />
            Google
          </button>
          <button class="btn btn-pill btn-outline" type="button" aria-label="Continue with Facebook" @click="loginWithFaceBook">
            <img
              src="data:image/svg+xml;utf8,
              <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='dodgerblue'><path d='M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24h11.495v-9.294H9.692V11.41h3.128V8.828c0-3.098 1.893-4.788 4.66-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.716-1.796 1.764v2.223h3.59l-.467 3.296h-3.123V24h6.127C23.407 24 24 23.407 24 22.675V1.325C24 .593 23.407 0 22.675 0z'/></svg>"
              alt=""
            />
            Facebook
          </button>
        </div>

        <div class="divider"><span>or</span></div>

        <div v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</div>

        <form v-if="mode === 'register'" class="form" @submit.prevent="handleSignup">
          <label>
            <span>Username</span>
            <input v-model="form.username" type="text" placeholder="Username" autocomplete="username" />
          </label>

          <label>
            <span>Email address</span>
            <input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" />
          </label>

          <label class="password">
            <span>Password</span>
            <input
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="new-password"
            />
            <button class="peek" type="button" aria-label="Show password" @click="togglePasswordVisible">Show</button>
          </label>

          <button class="btn btn-primary btn-wide" type="submit">
            {{ 'Sign up' }} <span class="arrow">→</span>
          </button>
        </form>

        <form v-if="mode === 'login'" class="form" @submit.prevent="handleLogin">
          <label>
            <span>Username or email</span>
            <input v-model="form.username" type="text" placeholder="you@example.com" autocomplete="username" />
          </label>

          <label class="password">
            <span>Password</span>
            <input
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button class="peek" type="button" aria-label="Show password" @click="togglePasswordVisible">Show</button>
          </label>

          <button class="btn btn-primary btn-wide" type="submit">
            {{ 'Log in' }} <span class="arrow">→</span>
          </button>
        </form>

        <p class="footnote">
          <template v-if="mode === 'register'">
            Already have an account?
            <a href="#" class="link" @click.prevent="setMode('login')">Log in</a>
          </template>
          <template v-else>
            Don't have an account?
            <a href="#" class="link" @click.prevent="setMode('register')">Sign up</a>
          </template>
        </p>
      </div>
    </section>

    <div class="auth-mosaic-wrap">
      <TopNav />
      <section
        class="mosaic"
        aria-hidden="true"
        style="--mosaicImage: url('https://images.unsplash.com/photo-1760344594784-60ff14035eb0?auto=format&fit=crop&q=80&w=1932')"
      >
      <img
        src="https://images.unsplash.com/photo-1760344594784-60ff14035eb0?auto=format&fit=crop&q=80&w=1932"
        alt=""
        class="mosaic__img"
      />
      <article class="art-1">
        <div class="tile img" style="--x:0;--y:0"></div>
        <div class="tile img tall" style="--x:1;--y:0"></div>
        <div class="tile img" style="--x:2;--y:0"></div>

        <div class="tile img" style="--x:0;--y:1"></div>

        <div class="tile panel">
          <div class="chip-list">
            <button class="chip">choose_template</button>
            <button class="chip is-active">setup_scene</button>
            <button class="chip">generate_3d_object</button>
          </div>
          <h3 class="panel-title">Fast Generation</h3>
          <p class="panel-sub">Create unique 3D objects in seconds</p>
        </div>

        <div class="tile img" style="--x:2;--y:1"></div>

        <div class="tile neon">
          <h3>Maximum<br />Customization</h3>
          <p>Tailor every aspect of your 3D object to your specifications</p>
          <div class="cta-icon" aria-hidden="true">o</div>
        </div>

        <div class="tile aqua"></div>
        <div class="tile img" style="--x:2;--y:2"></div>

        <div class="tile img wide" style="--x:0;--y:3"></div>
        <div class="tile img" style="--x:2;--y:3"></div>
        <div class="tile img" style="--x:1;--y:2"></div>
        <div class="tile img" style="--x:0;--y:2"></div>
      </article>

      <article class="art-2">
        <div class="tile img" style="--x:0;--y:0"></div>
        <div class="tile img tall" style="--x:1;--y:0"></div>
        <div class="tile img" style="--x:2;--y:0"></div>

        <div class="tile img" style="--x:0;--y:1"></div>

        <div class="tile panel">
          <div class="chip-list">
            <button class="chip">choose_template</button>
            <button class="chip is-active">setup_scene</button>
            <button class="chip">generate_3d_object</button>
          </div>
          <h3 class="panel-title">Fast Generation</h3>
          <p class="panel-sub">Create unique 3D objects in seconds</p>
        </div>

        <div class="tile img" style="--x:2;--y:1"></div>

        <div class="tile neon">
          <h3>Maximum<br />Customization</h3>
          <p>Tailor every aspect of your 3D object to your specifications</p>
          <div class="cta-icon" aria-hidden="true">o</div>
        </div>

        <div class="tile aqua"></div>
        <div class="tile img" style="--x:2;--y:2"></div>

        <div class="tile img wide" style="--x:0;--y:3"></div>
        <div class="tile img" style="--x:2;--y:3"></div>
        <div class="tile img" style="--x:1;--y:2"></div>
        <div class="tile img" style="--x:0;--y:2"></div>
      </article>
    </section>
    </div>
  </div>
</template>
