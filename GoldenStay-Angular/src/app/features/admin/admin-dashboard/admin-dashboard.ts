import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RoomService } from '../../../core/services/room.service';
import { Room } from '../../../core/models/room.model';
import { NotifyService } from '../../../shared/notify/notify';
import { Icon } from '../../../shared/icon/icon';
import { ImageFallback } from '../../../shared/image-fallback/image-fallback';
import { AdminShell } from '../admin-shell/admin-shell';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, Icon, ImageFallback, AdminShell],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['../admin.css', './admin-dashboard.css'],
})
export class AdminDashboard {
  protected rooms = inject(RoomService);
  private notify = inject(NotifyService);

  protected draft = signal<Room | null>(null);
  protected saving = signal(false);
  protected query = signal('');

  protected visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const list = this.rooms.rooms();
    if (!needle) return list;
    return list.filter(room =>
      `${room.title} ${room.description}`.toLowerCase().includes(needle),
    );
  });

  protected stats = computed(() => {
    const list = this.rooms.rooms();
    if (!list.length) return { count: 0, average: 0, beds: 0, top: 0 };

    const total = list.reduce((sum, room) => sum + room.pricePerNight, 0);
    return {
      count: list.length,
      average: total / list.length,
      beds: list.reduce((sum, room) => sum + room.capacity, 0),
      top: Math.max(...list.map(room => room.pricePerNight)),
    };
  });

  protected openEditor(room: Room) {
    // Copia di lavoro: la tabella sottostante non deve cambiare mentre si digita.
    this.draft.set({ ...room });
  }

  protected closeEditor() {
    this.draft.set(null);
  }

  protected patchDraft<K extends keyof Room>(key: K, value: Room[K]) {
    const current = this.draft();
    if (current) this.draft.set({ ...current, [key]: value });
  }

  protected save() {
    const room = this.draft();
    if (!room) return;

    if (!room.title?.trim()) {
      this.notify.error('Titolo mancante', 'Ogni camera deve avere un nome riconoscibile.');
      return;
    }

    this.saving.set(true);
    this.rooms.updateRoom(room.id, room).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeEditor();
        this.notify.success('Camera aggiornata', room.title);
      },
      error: () => {
        this.saving.set(false);
        this.notify.error('Salvataggio non riuscito', 'Il servizio non ha risposto.');
      },
    });
  }

  protected async remove(room: Room) {
    const confirmed = await this.notify.ask({
      title: 'Eliminare questa camera?',
      detail: `"${room.title}" sparirà dal catalogo pubblico. L'operazione non è reversibile.`,
      confirmLabel: 'Elimina',
      danger: true,
    });

    if (!confirmed) return;

    this.rooms.deleteRoom(room.id).subscribe({
      next: () => this.notify.success('Camera eliminata', room.title),
      error: () =>
        this.notify.error(
          'Eliminazione non riuscita',
          'Potrebbero esserci prenotazioni collegate a questa camera.',
        ),
    });
  }

  protected refresh() {
    this.rooms.loadRooms();
    this.notify.info('Catalogo aggiornato');
  }
}
