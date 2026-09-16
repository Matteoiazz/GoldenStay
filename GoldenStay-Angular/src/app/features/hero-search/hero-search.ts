import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RoomService, addDays, countNights, toIsoDate } from '../../core/services/room.service';
import { NotifyService } from '../../shared/notify/notify';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './hero-search.html',
  styleUrls: ['./hero-search.css'],
})
export class HeroSearchComponent {
  protected rooms = inject(RoomService);
  private notify = inject(NotifyService);

  protected readonly today = toIsoDate(new Date());
  protected readonly maxGuests = 6;

  protected checkIn = signal(this.today);
  protected checkOut = signal(toIsoDate(addDays(new Date(), 2)));
  protected guests = signal(2);

  protected nights = computed(() => countNights(this.checkIn(), this.checkOut()));

  /** Il check-out non può mai precedere il giorno successivo all'arrivo. */
  protected minCheckOut = computed(() => toIsoDate(addDays(new Date(this.checkIn()), 1)));

  constructor() {
    this.submit(true);
  }

  protected onCheckInChange(value: string) {
    this.checkIn.set(value);
    if (countNights(value, this.checkOut()) < 1) {
      this.checkOut.set(toIsoDate(addDays(new Date(value), 1)));
    }
  }

  protected onCheckOutChange(value: string) {
    this.checkOut.set(value);
  }

  protected stepGuests(delta: number) {
    this.guests.update(current => Math.min(this.maxGuests, Math.max(1, current + delta)));
  }

  protected submit(silent = false) {
    if (this.nights() < 1) {
      this.notify.error('Date non valide', 'La partenza deve essere successiva all\'arrivo.');
      return;
    }

    this.rooms.search({
      guests: this.guests(),
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
    });

    if (!silent) {
      document.getElementById('camere')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
