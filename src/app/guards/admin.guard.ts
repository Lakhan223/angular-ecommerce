import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  auth.ensureHydrated();

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if ((auth.userRole() || '').toLowerCase() !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
