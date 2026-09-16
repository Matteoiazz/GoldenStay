import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RoomService, addDays, countNights, toIsoDate } from '../../core/services/room.service';
import { BookingCalculator } from '../../core/services/booking-calculator';
import { AuthService } from '../../core/services/auth';
import { Room } from '../../core/models/room.model';
import { PaymentModal } from '../payment-modal/payment-modal';
import { Icon } from '../../shared/icon/icon';
import { ImageFallback } from '../../shared/image-fallback/image-fallback';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, PaymentModal, Icon, ImageFallback],
  templateUrl: './room-detail.html',
  styleUrls: ['./room-detail.css'],
})
export class RoomDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rooms = inject(RoomService);
  private calculator = inject(BookingCalculator);
  protected auth = inject(AuthService);

  protected room = signal<Room | undefined>(undefined);
  protected loading = signal(true);
  protected showModal = signal(false);

  protected readonly today = toIsoDate(new Date());
  protected checkIn = signal(this.today);
  protected checkOut = signal(toIsoDate(addDays(new Date(), 2)));
  protected guests = signal(1);

  protected readonly services = [
    { icon: 'wifi', label: 'Wi-Fi in fibra' },
    { icon: 'coffee', label: 'Colazione inclusa' },
    { icon: 'sparkle', label: 'Riassetto quotidiano' },
    { icon: 'waves', label: 'Spiaggia privata' },
    { icon: 'shield', label: 'Cancellazione gratuita' },
    { icon: 'key', label: 'Check-in 24 ore' },
  ];

  protected readonly rules = [
    { label: 'Check-in', value: 'dalle 15:00' },
    { label: 'Check-out', value: 'entro le 11:00' },
    { label: 'Animali', value: 'ammessi su richiesta' },
    { label: 'Camera', value: 'non fumatori' },
  ];

  protected minCheckOut = computed(() => toIsoDate(addDays(new Date(this.checkIn()), 1)));

  protected nights = computed(() => countNights(this.checkIn(), this.checkOut()));

  protected quote = computed(() => {
    const room = this.room();
    if (!room) return null;
    return this.calculator.quote(room.pricePerNight, this.checkIn(), this.checkOut());
  });

  /** La camera non può ospitare più persone della sua capienza. */
  protected overCapacity = computed(() => {
    const room = this.room();
    return !!room && this.guests() > room.capacity;
  });

  ngOnInit() {
    const criteria = this.rooms.searchCriteria();
    if (criteria.checkIn && criteria.checkOut) {
      this.checkIn.set(criteria.checkIn);
      this.checkOut.set(criteria.checkOut);
    }
    this.guests.set(Math.max(1, criteria.guests));

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }

    const cached = this.rooms.getRoomById(id);
    if (cached) {
      this.room.set(cached);
      this.loading.set(false);
      return;
    }

    // Accesso diretto all'indirizzo della camera: il catalogo non è in memoria.
    this.rooms.fetchRoomById(id).subscribe({
      next: room => {
        this.room.set(room ?? undefined);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onCheckInChange(value: string) {
    this.checkIn.set(value);
    if (countNights(value, this.checkOut()) < 1) {
      this.checkOut.set(toIsoDate(addDays(new Date(value), 1)));
    }
  }

  protected stepGuests(delta: number) {
    const max = this.room()?.capacity ?? 6;
    this.guests.update(current => Math.min(max, Math.max(1, current + delta)));
  }

  protected book() {
    if (this.auth.isLoggedIn) {
      this.showModal.set(true);
      return;
    }

    this.auth.redirectUrl = this.router.url;
    this.router.navigate(['/login']);
  }
}
