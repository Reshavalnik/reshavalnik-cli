import axios, { type AxiosError } from 'axios'

const TOKEN_STORAGE_KEY = 'token'

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

const clearAuthStorage = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthStorage()
      window.location.assign('/auth')
    }
    return Promise.reject(error)
  },
)

export default http
