import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export interface Booking {
  id: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  user?: { id?: number; name?: string; email?: string };
  room?: { id?: number; title?: string };
}

export interface BookingDraft {
  userId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/bookings';

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);

  readonly active = computed(() => this.bookings().filter(b => b.status !== 'CANCELLATA'));

  readonly revenue = computed(() =>
    this.active().reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
  );

  readonly nightsSold = computed(() =>
    this.active().reduce((sum, booking) => {
      const span = new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime();
      return sum + Math.max(0, Math.round(span / 86_400_000));
    }, 0),
  );

  loadBookings() {
    this.loading.set(true);
    this.failed.set(false);

    this.http
      .get<Booking[]>(`${this.apiUrl}/all`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: data => this.bookings.set(data),
        error: () => {
          this.bookings.set([]);
          this.failed.set(true);
        },
      });
  }

  create(draft: BookingDraft): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, draft);
  }

  /** Annulla mantenendo la riga a registro, così lo storico resta consultabile. */
  cancel(id: number) {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, {}).pipe(tap(() => this.loadBookings()));
  }

  remove(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(tap(() => this.loadBookings()));
  }

  removeAll() {
    return this.http.delete(`${this.apiUrl}/all`).pipe(tap(() => this.loadBookings()));
  }
}
