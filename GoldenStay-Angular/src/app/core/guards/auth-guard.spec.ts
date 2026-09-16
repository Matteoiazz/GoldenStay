import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  const run: CanActivateFn = (...params) =>
    TestBed.runInInjectionContext(() => authGuard(...params));

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/admin-dashboard' } as RouterStateSnapshot;

  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
  });

  it('blocca chi non ha effettuato l\'accesso e ne ricorda la destinazione', () => {
    expect(run(route, state)).toBeInstanceOf(UrlTree);
    expect(auth.redirectUrl).toBe('/admin-dashboard');
  });

  it('blocca un utente autenticato senza ruolo amministratore', () => {
    auth.currentUser.set({ email: 'ospite@goldenstay.it', role: 'USER' });
    expect(run(route, state)).toBeInstanceOf(UrlTree);
  });

  it('lascia passare un amministratore', () => {
    auth.currentUser.set({ email: 'admin@goldenstay.it', role: 'ADMIN' });
    expect(run(route, state)).toBeTrue();
  });
});
