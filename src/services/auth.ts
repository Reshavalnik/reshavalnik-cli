// Expects backend endpoints: POST /auth/signin, POST /auth/signup, GET /auth/me; social login URLs: <baseURL>/oauth2/authorization/<provider>.
import { ref } from 'vue'
import http from './http'
import { clear } from './tokenStorage'

export interface SigninPayload {
  username: string
  password: string
}

export interface SignupPayload {
  email?: string
  password: string
  username: string
}

export type AuthResponse = Record<string, unknown>

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const buildSocialUrl = (provider: string): string => {
  const base = apiBaseUrl.replace(/\/+$/, '')
  return `${base}/oauth2/authorization/${provider}`
}

const signin = async (payload: SigninPayload): Promise<AuthResponse> => {
  const response = await http.post<AuthResponse>('/auth/signin', payload)
  return response.data
}

const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await http.post<AuthResponse>('/auth/signup-student', payload)
  return response.data
}

const me = async (): Promise<AuthResponse> => {
  const response = await http.get<AuthResponse>('/auth/me')
  return response.data
}

const loggedIn = ref(false)
const roles = ref<string[]>([])
const checking = ref(false)
let checkInFlight: Promise<boolean> | null = null

const extractRoles = (response: AuthResponse): string[] => {
  const candidate = (response as { roles?: unknown }).roles ?? (response as { user?: { roles?: unknown } }).user?.roles
  if (Array.isArray(candidate)) {
    return candidate.filter((role): role is string => typeof role === 'string')
  }
  if (typeof candidate === 'string' && candidate.length > 0) {
    return [candidate]
  }
  return []
}

const checkSession = async (): Promise<boolean> => {
  if (checkInFlight) {
    return checkInFlight
  }
  checking.value = true
  checkInFlight = (async () => {
    try {
      const response = await me()
      loggedIn.value = true
      roles.value = extractRoles(response)
    } catch {
      loggedIn.value = false
      roles.value = []
    } finally {
      checking.value = false
      checkInFlight = null
    }
    return loggedIn.value
  })()
  return checkInFlight
}

const resetSessionState = (): void => {
  checkInFlight = null
  checking.value = false
  loggedIn.value = false
  roles.value = []
}

const logout = async (): Promise<void> => {
  await http.post('/auth/logout', null, { withCredentials: true })
  clear()
}

const getGoogleLoginUrl = (): string => {
  return buildSocialUrl('google')
}

const getGithubLoginUrl = (): string => {
  return buildSocialUrl('github')
}

const getFacebookLoginUrl = (): string => {
  return buildSocialUrl('facebook')
}

export { signin, signup, checkSession, resetSessionState, loggedIn, roles, checking, logout, getGoogleLoginUrl, getGithubLoginUrl, getFacebookLoginUrl }
