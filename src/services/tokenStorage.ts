const ACCESS_TOKEN_KEY = 'token'

const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

const clear = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

const isAuthenticated = (): boolean => {
  return Boolean(getAccessToken())
}

export { getAccessToken, setAccessToken, clear, isAuthenticated }
