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
  accessToken: string;
  tokenType?: string;
  refreshToken?: string;
  user?: {
    id: string | number;
    username: string;
    email: string;
    name?: string;
    roles?: string[];
    avatarUrl?: string;
  };
}

export interface UserProfile {
  id: string | number;
  username: string;
  email: string;
  name?: string;
  roles?: string[];
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = getApiBaseUrl();

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/register`, payload);
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/api/auth/me`);
  }

  // Social login helpers: backend should handle provider redirects and callback
  getSocialLoginUrl(provider: 'google' | 'facebook', redirectUri?: string): string {
    const cb = encodeURIComponent(
      redirectUri || this.getDefaultOAuthRedirectUri()
    );
    return `${this.baseUrl}/api/auth/oauth2/authorize/${provider}?redirect_uri=${cb}`;
  }

  getDefaultOAuthRedirectUri(): string {
    // Try window runtime config first
    const w = window as any;
    const fromWindow = w?.env?.OAUTH_REDIRECT_URI || w?.OAUTH_REDIRECT_URI;
    if (fromWindow) return fromWindow as string;
    return `${window.location.origin}/auth/callback`;
  }
}
