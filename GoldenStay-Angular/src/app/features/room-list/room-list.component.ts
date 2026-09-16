import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RoomService } from '../../core/services/room.service';
import { BookingCalculator, Quote } from '../../core/services/booking-calculator';
import { Room } from '../../core/models/room.model';
import { HeroSearchComponent } from '../hero-search/hero-search';
import { Icon } from '../../shared/icon/icon';
import { ImageFallback } from '../../shared/image-fallback/image-fallback';

type SortKey = 'consigliate' | 'prezzo-asc' | 'prezzo-desc' | 'capienza';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, HeroSearchComponent, Icon, ImageFallback],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent {
  protected rooms = inject(RoomService);
  private calculator = inject(BookingCalculator);

  protected sort = signal<SortKey>('consigliate');

  protected readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'consigliate', label: 'Consigliate' },
    { key: 'prezzo-asc', label: 'Prezzo crescente' },
    { key: 'prezzo-desc', label: 'Prezzo decrescente' },
    { key: 'capienza', label: 'Più spaziose' },
  ];

  protected readonly assurances = [
    { icon: 'shield', title: 'Cancellazione gratuita', text: 'Fino a 48 ore prima dell\'arrivo.' },
    { icon: 'sparkle', title: 'Pulizia quotidiana', text: 'Riassetto due volte al giorno.' },
    { icon: 'coffee', title: 'Colazione inclusa', text: 'Servita in terrazza fino alle 11.' },
    { icon: 'key', title: 'Check-in flessibile', text: 'Ricevimento aperto 24 ore su 24.' },
  ];

  protected readonly rates = [
    {
      name: 'Tariffa standard',
      value: 'Listino',
      text: 'Il prezzo di riferimento della camera, applicato ai soggiorni infrasettimanali.',
      tone: 'plain',
    },
    {
      name: 'Weekend',
      value: '+20%',
      text: 'Scatta quando il soggiorno comprende la notte del venerdì o del sabato.',
      tone: 'up',
    },
    {
      name: 'Alta stagione',
      value: '+20%',
      text: 'Agosto sulla Costa degli Dei: domanda alta e tramonti compresi nel prezzo.',
      tone: 'up',
    },
    {
      name: 'Lungo soggiorno',
      value: '−15%',
      text: 'Oltre sette notti lo sconto si applica da solo, senza codici da inserire.',
      tone: 'down',
    },
  ];

  protected readonly skeletons = Array.from({ length: 6 });

  protected visibleRooms = computed(() => {
    const list = [...this.rooms.filteredRooms()];
    switch (this.sort()) {
      case 'prezzo-asc':
        return list.sort((a, b) => a.pricePerNight - b.pricePerNight);
      case 'prezzo-desc':
        return list.sort((a, b) => b.pricePerNight - a.pricePerNight);
      case 'capienza':
        return list.sort((a, b) => b.capacity - a.capacity || a.pricePerNight - b.pricePerNight);
      default:
        return list;
    }
  });

  protected quoteFor(room: Room): Quote {
    const { checkIn, checkOut } = this.rooms.searchCriteria();
    return this.calculator.quote(room.pricePerNight, checkIn, checkOut);
  }

  protected retry() {
    const { checkIn, checkOut } = this.rooms.searchCriteria();
    this.rooms.loadRooms(checkIn, checkOut);
  }
}
