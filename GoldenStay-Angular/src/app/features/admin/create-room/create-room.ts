import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

import { RoomService } from '../../../core/services/room.service';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';
import { AdminShell } from '../admin-shell/admin-shell';

interface Blueprint {
  type: 'STANDARD' | 'DELUXE' | 'SUITE';
  name: string;
  tagline: string;
  price: number;
  capacity: number;
  icon: string;
  traits: string[];
  flag?: string;
}

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CurrencyPipe, Icon, AdminShell],
  templateUrl: './create-room.html',
  styleUrls: ['../admin.css', './create-room.css'],
})
export class CreateRoomComponent {
  private rooms = inject(RoomService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  protected building = signal<string | null>(null);

  protected readonly blueprints: Blueprint[] = [
    {
      type: 'STANDARD',
      name: 'Camera Standard',
      tagline: 'Essenziale, luminosa, affacciata sul cortile interno.',
      price: 80,
      capacity: 2,
      icon: 'bed',
      traits: ['Letto matrimoniale', 'Bagno con doccia', 'Scrivania'],
    },
    {
      type: 'DELUXE',
      name: 'Camera Deluxe',
      tagline: 'Più spazio e un balcone privato sul lungomare.',
      price: 180,
      capacity: 3,
      icon: 'waves',
      traits: ['Balcone privato', 'Vasca separata', 'Zona salotto'],
    },
    {
      type: 'SUITE',
      name: 'Golden Suite',
      tagline: 'Attico con jacuzzi e terrazza esclusiva sul promontorio.',
      price: 300,
      capacity: 4,
      icon: 'sparkle',
      traits: ['Terrazza privata', 'Jacuzzi', 'Servizio dedicato'],
      flag: 'Più richiesta',
    },
  ];

  protected async produce(blueprint: Blueprint) {
    const confirmed = await this.notify.ask({
      title: `Creare una ${blueprint.name}?`,
      detail: `Verrà pubblicata subito a ${blueprint.price} € a notte per ${blueprint.capacity} ospiti. Potrai modificarla dal catalogo.`,
      confirmLabel: 'Crea la camera',
    });

    if (!confirmed) return;

    this.building.set(blueprint.type);

    this.rooms.createRoomByFactory(blueprint.type).subscribe({
      next: () => {
        this.building.set(null);
        this.notify.success('Camera creata', `${blueprint.name} è ora a catalogo.`);
        this.router.navigate(['/admin-dashboard']);
      },
      error: () => {
        this.building.set(null);
        this.notify.error('Creazione non riuscita', 'Il servizio non ha accettato la richiesta.');
      },
    });
  }
}
