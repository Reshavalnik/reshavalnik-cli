// Expects backend endpoints: POST /auth/signin, POST /auth/signup, GET /auth/me; social login URLs: <baseURL>/oauth2/authorization/<provider>.
import http from './http'
import { clear } from './tokenStorage'

export interface SigninPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  name?: string
}

export type AuthResponse = Record<string, unknown>

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const buildSocialUrl = (provider: string): string => {
  const base = apiBaseUrl.replace(/\/+$/, '')
  return `${base}/oauth2/authorization/${provider}`
}

const signin = async (payload: SigninPayload): Promise<AuthResponse> => {
  const response = await http.post<AuthResponse>('/auth/signin', payload)
  return response.data
}

const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await http.post<AuthResponse>('/auth/signup', payload)
  return response.data
}

const me = async (): Promise<AuthResponse> => {
  const response = await http.get<AuthResponse>('/auth/me')
  return response.data
}

const logout = (): void => {
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

export { signin, signup, me, logout, getGoogleLoginUrl, getGithubLoginUrl, getFacebookLoginUrl }
