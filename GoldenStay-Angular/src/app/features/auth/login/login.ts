import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './login.html',
  styleUrls: ['../auth.css'],
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  protected email = signal('');
  protected password = signal('');
  protected reveal = signal(false);
  protected busy = signal(false);
  protected error = signal('');

  protected fillDemo() {
    this.email.set('admin@goldenstay.it');
    this.password.set('admin123');
    this.error.set('');
  }

  protected submit() {
    if (!this.email().trim() || !this.password()) {
      this.error.set('Compila email e password per continuare.');
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: user => {
        this.busy.set(false);
        this.notify.success('Bentornato', user.name ? `Buon soggiorno, ${user.name}.` : undefined);

        const redirect = this.auth.consumeRedirect();
        if (redirect) {
          this.router.navigateByUrl(redirect);
          return;
        }

        this.router.navigate([this.auth.isAdmin() ? '/admin-dashboard' : '/']);
      },
      error: (response: HttpErrorResponse) => {
        this.busy.set(false);
        // Lo stato 0 significa che il server non ha risposto affatto: dirlo
        // evita di far cercare all'ospite un errore di digitazione che non c'è.
        this.error.set(
          response.status === 401
            ? 'Email o password non corrispondono a nessun account.'
            : 'Servizio momentaneamente non raggiungibile. Riprova fra poco.',
        );
      },
    });
  }
}
