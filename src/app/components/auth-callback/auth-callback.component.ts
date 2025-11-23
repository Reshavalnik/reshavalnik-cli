import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthService } from '../../services/auth.service';

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
  private auth = inject(AuthService);

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
      this.router.navigateByUrl('/panel');
      return;
    }

    // If no token provided, try to validate cookie session
    this.auth.me().subscribe({
      next: user => {
        if (user) {
          this.tokens.setUser(user);
          this.tokens.setSessionAuthenticated(true);
          this.router.navigateByUrl('/panel');
        } else {
          this.router.navigate(['/auth'], { queryParams: { error: 'missing_token' } });
        }
      },
      error: _ => this.router.navigate(['/auth'], { queryParams: { error: 'missing_token' } })
    });
  }
}
