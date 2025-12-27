import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';
const SESSION_KEY = 'auth.session';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  setUser(user: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser<T = any>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  clearUser() {
    localStorage.removeItem(USER_KEY);
  }

  setSessionAuthenticated(authenticated: boolean) {
    if (authenticated) localStorage.setItem(SESSION_KEY, '1');
    else localStorage.removeItem(SESSION_KEY);
  }

  get hasSession(): boolean {
    return localStorage.getItem(SESSION_KEY) === '1';
  }

  clearAll() {
    this.clearToken();
    this.clearUser();
    this.setSessionAuthenticated(false);
  }

  get isAuthenticated(): boolean {
    // Consider authenticated if we have a bearer token, or a validated session flag, or a stored user profile
    return !!this.getToken() || this.hasSession || !!this.getUser();
  }
}
