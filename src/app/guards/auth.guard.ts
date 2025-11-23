import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStorageService);
  const router = inject(Router);
  const auth = inject(AuthService);

  // If we already have a token/session/user, allow
  if (tokenStore.isAuthenticated) {
    return true;
  }

  // Try to validate session via cookie by calling /auth/me
  return auth.me().pipe(
    map(user => {
      if (user) {
        tokenStore.setUser(user);
        tokenStore.setSessionAuthenticated(true);
        return true;
      }
      router.navigate(['/auth']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/auth']);
      return of(false);
    })
  );
};
