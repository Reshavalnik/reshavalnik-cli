import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getAccessToken, isAuthenticated } from '../services/tokenStorage'

type HttpErrorLike = {
  response?: {
    status?: number
  }
  config?: {
    url?: string
    method?: string
  }
}

const lastHttpStatus = ref<number | null>(null)

const setLastHttpStatus = (status: number | null): void => {
  lastHttpStatus.value = status
}

const getCurrentRoute = (): string => {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

const logRouteChange = (
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
): void => {
  console.info('[dev][route] change', {
    from: from.fullPath,
    to: to.fullPath,
  })
}

const logAuthState = (label: string): void => {
  const hasToken = Boolean(getAccessToken())
  console.info('[dev][auth]', label, {
    isAuthenticated: isAuthenticated(),
    hasToken,
    route: getCurrentRoute(),
  })
}

const logHttpError = (context: string, error: HttpErrorLike): void => {
  const status = error.response?.status ?? null
  const endpoint = error.config?.url ?? 'unknown'
  console.warn('[dev][http]', context, {
    status,
    endpoint,
  })
}

export { lastHttpStatus, setLastHttpStatus, logRouteChange, logAuthState, logHttpError }
