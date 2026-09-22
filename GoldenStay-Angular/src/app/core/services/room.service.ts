import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

import { Room } from '../models/room.model';
import { environment } from '../../../environments/environment';

export interface SearchCriteria {
  guests: number;
  checkIn: string;
  checkOut: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);

  readonly searchCriteria = signal<SearchCriteria>({ guests: 1, checkIn: '', checkOut: '' });

  /** Le date sono valorizzate solo dopo una ricerca esplicita dell'ospite. */
  readonly hasDates = computed(() => {
    const { checkIn, checkOut } = this.searchCriteria();
    return !!checkIn && !!checkOut;
  });

  readonly nights = computed(() => {
    const { checkIn, checkOut } = this.searchCriteria();
    return countNights(checkIn, checkOut);
  });

  readonly filteredRooms = computed(() => {
    const { guests } = this.searchCriteria();
    return this.rooms().filter(room => room.capacity >= guests);
  });

  constructor() {
    this.loadRooms();
  }

  loadRooms(checkIn?: string, checkOut?: string) {
    let params = new HttpParams();
    if (checkIn && checkOut) {
      params = params.set('checkIn', checkIn).set('checkOut', checkOut);
    }

    this.loading.set(true);
    this.failed.set(false);

    this.http
      .get<Room[]>(this.apiUrl, { params })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: data => this.rooms.set(data),
        error: () => {
          this.rooms.set([]);
          this.failed.set(true);
        },
      });
  }

  /** Aggiorna i criteri e ricarica la disponibilità reale dal backend. */
  search(criteria: SearchCriteria) {
    this.searchCriteria.set(criteria);
    this.loadRooms(criteria.checkIn, criteria.checkOut);
  }

  getRoomById(id: number): Room | undefined {
    return this.rooms().find(room => room.id === id);
  }

  fetchRoomById(id: number) {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  // --- Back office ---------------------------------------------------------

  deleteRoom(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(tap(() => this.loadRooms()));
  }

  createRoomByFactory(type: string) {
    return this.http.post<Room>(`${this.apiUrl}/factory/${type}`, {}).pipe(tap(() => this.loadRooms()));
  }

  updateRoom(id: number, room: Partial<Room>) {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room).pipe(tap(() => this.loadRooms()));
  }
}

/** Notti fra due date ISO; 0 se l'intervallo non è valido. */
export function countNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const span = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.round(span / 86_400_000);
  return nights > 0 ? nights : 0;
}

/** Data in formato YYYY-MM-DD, quello atteso dagli input nativi e dal backend. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
