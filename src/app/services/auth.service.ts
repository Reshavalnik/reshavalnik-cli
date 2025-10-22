import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  tokenType?: string;
  refreshToken?: string;
  user?: UserProfile;
}

export interface UserProfile {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[] | string;
  avatarUrl?: string;
}

function getApiBaseUrl(): string {
  // Try window object config first (allows runtime override without rebuild)
  const w = window as any;
  const fromWindow = w?.env?.API_BASE_URL || w?.API_BASE_URL;
  if (fromWindow) return fromWindow as string;
  // Fallback to environment-like Vite/Angular variables if present
  const fromMeta = (document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement)?.content;
  if (fromMeta) return fromMeta;
  // Default for local development
  return 'http://localhost:8080';
}

/**
 * Authentication service.
 *
 * - Provides classic login/register endpoints.
 * - Supports social token-exchange flow where the frontend sends a provider token (e.g., Google id_token)
 *   and the backend performs verification and issues a session (JWT in HttpOnly cookie).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = getApiBaseUrl();

  login(payload: LoginRequest): Observable<AuthResponse> {
    const body = { username: payload.usernameOrEmail, password: payload.password } as any;
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signin`, body);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, payload);
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/auth/me`);
  }

  // Social login helpers: backend should handle provider redirects and callback
  getSocialLoginUrl(provider: 'google' | 'facebook', redirectUri?: string): string {
    const cb = encodeURIComponent(
      redirectUri || this.getDefaultOAuthRedirectUri()
    );
    return `${this.baseUrl}/auth/oauth2/authorize/${provider}?redirect_uri=${cb}`;
  }

  // Token-exchange flow: POST id_token/access_token to backend
  socialLogin(provider: string, token: string) {
    const redirectUri = this.getDefaultOAuthRedirectUri();
    const url = `${this.baseUrl}/auth/oauth2/login/${provider}`;
    return this.http.post(`${url}`, { token, redirectUri }, { observe: 'response' });
  }

  getDefaultOAuthRedirectUri(): string {
    // Try window runtime config first
    const w = window as any;
    const fromWindow = w?.env?.OAUTH_REDIRECT_URI || w?.OAUTH_REDIRECT_URI;
    if (fromWindow) return fromWindow as string;
    return `${window.location.origin}/auth/callback`;
  }
}
