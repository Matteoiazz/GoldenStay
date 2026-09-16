import { Component, Input, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';

/**
 * Telaio comune alle pagine di back office: barra laterale, intestazione
 * della pagina e area per le azioni proiettate da ciascuna schermata.
 */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './admin-shell.html',
  styleUrls: ['./admin-shell.css'],
})
export class AdminShell {
  @Input({ required: true }) heading = '';
  @Input() eyebrow = 'Back office';
  @Input() subtitle = '';

  protected auth = inject(AuthService);
  private notify = inject(NotifyService);

  protected navOpen = signal(false);

  protected readonly links = [
    { path: '/admin-dashboard', icon: 'layers', label: 'Camere', exact: true },
    { path: '/admin/booking', icon: 'receipt', label: 'Prenotazioni', exact: false },
    { path: '/create-room', icon: 'plus', label: 'Nuova camera', exact: false },
  ];

  protected initials = computed(() => {
    const name = this.auth.currentUser()?.name?.trim();
    if (!name) return 'GS';
    return name.split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  });

  protected logout() {
    this.auth.logout();
    this.notify.info('Sessione chiusa');
  }
}
