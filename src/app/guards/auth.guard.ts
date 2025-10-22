import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStore.isAuthenticated) {
    return true;
  }
  router.navigate(['/auth']);
  return false;
};
