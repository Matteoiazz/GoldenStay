import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

/** Protegge le rotte di back office: serve una sessione con ruolo ADMIN. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  if (auth.isLoggedIn) {
    // Utente autenticato ma senza permessi: lo riportiamo al sito pubblico.
    return router.createUrlTree(['/']);
  }

  auth.redirectUrl = state.url;
  return router.createUrlTree(['/login']);
};
