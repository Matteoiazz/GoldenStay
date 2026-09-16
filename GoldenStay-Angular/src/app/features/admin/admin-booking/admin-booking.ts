import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { Booking, BookingService } from '../../../core/services/booking';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';
import { AdminShell } from '../admin-shell/admin-shell';

type Filter = 'tutte' | 'confermate' | 'cancellate';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon, AdminShell],
  templateUrl: './admin-booking.html',
  styleUrls: ['../admin.css', './admin-booking.css'],
})
export class AdminBookingsComponent implements OnInit {
  protected bookings = inject(BookingService);
  private notify = inject(NotifyService);

  protected filter = signal<Filter>('tutte');
  protected query = signal('');

  protected readonly filters: { key: Filter; label: string }[] = [
    { key: 'tutte', label: 'Tutte' },
    { key: 'confermate', label: 'Confermate' },
    { key: 'cancellate', label: 'Annullate' },
  ];

  protected visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const mode = this.filter();

    return this.bookings.bookings().filter(booking => {
      if (mode === 'confermate' && booking.status === 'CANCELLATA') return false;
      if (mode === 'cancellate' && booking.status !== 'CANCELLATA') return false;
      if (!needle) return true;

      const haystack = [
        booking.id,
        booking.user?.name,
        booking.user?.email,
        booking.room?.title,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  });

  ngOnInit() {
    this.bookings.loadBookings();
  }

  protected nightsOf(booking: Booking): number {
    const span = new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime();
    return Math.max(0, Math.round(span / 86_400_000));
  }

  protected async cancel(booking: Booking) {
    const confirmed = await this.notify.ask({
      title: `Annullare la prenotazione #${booking.id}?`,
      detail: `La camera tornerà disponibile per ${booking.user?.name || 'l\'ospite'}. La riga resta a registro come annullata.`,
      confirmLabel: 'Annulla prenotazione',
      cancelLabel: 'Torna indietro',
      danger: true,
    });

    if (!confirmed) return;

    this.bookings.cancel(booking.id).subscribe({
      next: () => this.notify.success('Prenotazione annullata', `#${booking.id} · camera liberata`),
      error: () => this.notify.error('Operazione non riuscita', 'Il servizio non ha risposto.'),
    });
  }

  protected async purge() {
    const confirmed = await this.notify.ask({
      title: 'Svuotare il registro?',
      detail: 'Tutte le prenotazioni verranno eliminate definitivamente dal database, comprese quelle confermate.',
      confirmLabel: 'Elimina tutto',
      danger: true,
    });

    if (!confirmed) return;

    this.bookings.removeAll().subscribe({
      next: () => this.notify.success('Registro svuotato'),
      error: () => this.notify.error('Operazione non riuscita', 'Il servizio non ha risposto.'),
    });
  }

  protected refresh() {
    this.bookings.loadBookings();
    this.notify.info('Registro aggiornato');
  }
}
