import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id?: number;
  name?: string;
  email: string;
  password?: string;
  role?: string;
}

const STORAGE_KEY = 'goldenstay.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/users';

  readonly currentUser = signal<User | null>(restore());

  readonly isAdmin = computed(() => this.currentUser()?.role?.toUpperCase() === 'ADMIN');

  /** Pagina da riaprire dopo un accesso richiesto a metà percorso. */
  redirectUrl: string | null = null;

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(user => this.remember(user)));
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap(user => this.remember(user)));
  }

  logout() {
    this.currentUser.set(null);
    this.redirectUrl = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* modalità privata o storage disabilitato */
    }
    this.router.navigate(['/']);
  }

  /** Restituisce la destinazione salvata e la azzera, così vale una volta sola. */
  consumeRedirect(): string | null {
    const target = this.redirectUrl;
    this.redirectUrl = null;
    return target;
  }

  private remember(user: User) {
    this.currentUser.set(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* la sessione resterà valida solo per questa scheda */
    }
  }
}

function restore(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
