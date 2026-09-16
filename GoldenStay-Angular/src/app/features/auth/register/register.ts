import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './register.html',
  styleUrls: ['../auth.css'],
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  protected name = signal('');
  protected email = signal('');
  protected password = signal('');
  protected confirm = signal('');
  protected accepted = signal(false);
  protected reveal = signal(false);
  protected busy = signal(false);
  protected touched = signal(false);
  protected error = signal('');

  /** Quattro criteri indipendenti: lunghezza, maiuscola, cifra, simbolo. */
  protected strength = computed(() => {
    const value = this.password();
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  });

  protected strengthTone = computed(() =>
    this.strength() <= 1 ? 'weak' : this.strength() === 2 ? 'fair' : 'strong',
  );

  protected strengthLabel = computed(() => {
    if (!this.password()) return 'Almeno 6 caratteri, meglio se con numeri e simboli.';
    return ['Molto debole', 'Debole', 'Accettabile', 'Buona', 'Ottima'][this.strength()];
  });

  protected errors = computed(() => ({
    name: this.name().trim().length < 2,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email().trim()),
    password: this.password().length < 6,
    confirm: this.confirm() !== this.password() || !this.confirm(),
    accepted: !this.accepted(),
  }));

  protected valid = computed(() => !Object.values(this.errors()).some(Boolean));

  protected submit() {
    this.touched.set(true);
    this.error.set('');
    if (!this.valid()) return;

    this.busy.set(true);

    this.auth.register(this.name().trim(), this.email().trim(), this.password()).subscribe({
      next: user => {
        this.busy.set(false);
        this.notify.success('Account creato', `Benvenuto in GoldenStay, ${user.name || 'ospite'}.`);
        this.router.navigate(['/']);
      },
      error: (response: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(
          response.status === 400
            ? response.error?.error || 'Esiste già un account con questa email.'
            : 'Servizio momentaneamente non raggiungibile. Riprova fra poco.',
        );
      },
    });
  }
}
