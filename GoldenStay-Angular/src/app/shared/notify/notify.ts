import { Injectable, signal } from '@angular/core';

export type Tone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: Tone;
  title: string;
  detail?: string;
}

export interface ConfirmRequest {
  title: string;
  detail: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (ok: boolean) => void;
}

/**
 * Sostituisce alert()/confirm() del browser con avvisi e dialoghi coerenti
 * con il resto dell'interfaccia.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  readonly toasts = signal<Toast[]>([]);
  readonly pending = signal<PendingConfirm | null>(null);

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(title: string, detail?: string) { this.push('success', title, detail); }
  error(title: string, detail?: string)   { this.push('error', title, detail); }
  info(title: string, detail?: string)    { this.push('info', title, detail); }

  dismiss(id: number) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Apre il dialogo e risolve a true solo se l'utente conferma. */
  ask(request: Partial<ConfirmRequest> & { title: string }): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.pending.set({
        detail: '',
        confirmLabel: 'Conferma',
        cancelLabel: 'Annulla',
        danger: false,
        ...request,
        resolve,
      });
    });
  }

  settle(answer: boolean) {
    const current = this.pending();
    if (!current) return;
    this.pending.set(null);
    current.resolve(answer);
  }

  private push(tone: Tone, title: string, detail?: string) {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, tone, title, detail }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), 5000));
  }
}
