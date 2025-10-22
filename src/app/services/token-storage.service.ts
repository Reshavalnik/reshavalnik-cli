import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

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

  clearAll() {
    this.clearToken();
    this.clearUser();
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
