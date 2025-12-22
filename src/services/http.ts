import axios, { type AxiosError } from 'axios'
import { logHttpError, setLastHttpStatus } from '../dev/runtimeDiagnostics'
import { clear, getAccessToken } from './tokenStorage'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      setLastHttpStatus(response.status ?? null)
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status ?? null
    if (import.meta.env.DEV) {
      setLastHttpStatus(status)
    }
    if (status === 401) {
      if (import.meta.env.DEV) {
        logHttpError('401 unauthorized', error)
        console.info('[dev][auth] token cleared after 401')
      }
      clear()
      window.location.assign('/auth')
    }
    return Promise.reject(error)
  },
)

export default http
