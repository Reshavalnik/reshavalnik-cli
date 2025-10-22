import { AfterViewInit, Component, Input, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Declare the Google global to satisfy TypeScript
declare global {
  interface Window { google?: any }
}

/**
 * Renders the Google Identity Services sign-in button and handles the
 * token-exchange flow. The component never stores or processes the Google
 * id_token beyond sending it to the backend.
 */
@Component({
  selector: 'app-google-login-button',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div id="googleBtn"></div>
  `,
})
export class GoogleLoginButtonComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  // Allow clientId to be passed from parent or via window config
  @Input() clientId: string | null = null;

  ngAfterViewInit(): void {
    this.ensureGsiLoaded().then(() => this.renderButton());
  }

  private ensureGsiLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const attempt = () => {
        if (window.google?.accounts?.id) {
          resolve();
        } else if (Date.now() - started > 5000) {
          console.error('Google Identity Services SDK failed to load');
          reject(new Error('Google Identity Services SDK failed to load'));
        } else {
          setTimeout(attempt, 50);
        }
      };
      attempt();
    });
  }

  private renderButton() {
    const cid = this.clientId || (window as any)?.env?.GOOGLE_CLIENT_ID || (window as any)?.GOOGLE_CLIENT_ID || '337459070157-9lnbkunmcfe74akrj7ddo4n1s2ps98bp.apps.googleusercontent.com';
    window.google.accounts.id.initialize({
      client_id: cid,
      callback: (response: any) => this.onGoogleCredential(response?.credential)
    });
    const el = document.getElementById('googleBtn');
    if (el) {
      window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large' });
    }
  }

  private onGoogleCredential(idToken?: string) {
    if (!idToken) return;
    // Post the id_token to backend and follow redirect instruction
    this.authService.socialLogin('google', idToken).subscribe({
      next: res => {
        const redirectTo = res.headers?.get('X-Redirect-To');
        if (redirectTo) {
          window.location.href = redirectTo;
          return;
        }
        // Fallback: navigate to default callback to let it try cookie-based auth
        this.zone.run(() => this.router.navigateByUrl('/auth/callback'));
      },
      error: err => {
        console.error('Google social login failed', err);
      }
    });
  }
}
