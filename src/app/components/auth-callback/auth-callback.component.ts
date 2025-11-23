import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../services/token-storage.service';

/**
 * Minimal callback page used after social login completes.
 *
 * The backend should establish the session via HttpOnly cookie. If the server also
 * appends a token in the query string, we store it as a convenience for APIs
 * that still expect an Authorization header. Cookie-based auth is preferred.
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback">
      <p>Signing you in...</p>
    </div>
  `,
  styles: [`.callback{padding:40px;text-align:center;color:#555}`]
})
export class AuthCallbackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tokens = inject(TokenStorageService);

  ngOnInit() {
    // Token may arrive as query param (?token=) or as URL hash (#access_token=)
    const qpToken = this.route.snapshot.queryParamMap.get('token')
      || this.route.snapshot.queryParamMap.get('access_token');

    let tokenFromHash: string | null = null;
    if (!qpToken && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      tokenFromHash = params.get('token') || params.get('access_token');
    }

    const token = qpToken || tokenFromHash;
    if (token) {
      this.tokens.setToken(token);
      // Optionally, try to fetch user profile after social login
      // Ignore errors and just redirect
      try {
        // Using dynamic import to avoid direct circular dep
        import('../../services/auth.service').then(m => m.AuthService).then(() => {
          // nothing mandatory here without DI
        });
      } catch {}
      this.router.navigateByUrl('/panel');
    } else {
      this.router.navigate(['/auth'], { queryParams: { error: 'missing_token' } });
    }
  }
}
