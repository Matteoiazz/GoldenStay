import {
  Component, EventEmitter, HostListener, Input, OnDestroy, Output, computed, inject, signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

import { Room } from '../../core/models/room.model';
import { BookingService } from '../../core/services/booking';
import { AuthService } from '../../core/services/auth';
import { NotifyService } from '../../shared/notify/notify';
import { Icon } from '../../shared/icon/icon';

type Brand = 'visa' | 'mastercard' | 'amex' | 'generic';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, Icon],
  templateUrl: './payment-modal.html',
  styleUrls: ['./payment-modal.css'],
})
export class PaymentModal implements OnDestroy {
  private bookings = inject(BookingService);
  private auth = inject(AuthService);
  private notify = inject(NotifyService);

  @Input() room: Room | undefined;
  @Input() totalPrice = 0;
  @Input() nights = 0;
  @Input() guests = 1;
  @Input() guestName = '';
  @Input() email = '';
  @Input() checkIn = '';
  @Input() checkOut = '';

  @Output() close = new EventEmitter<void>();

  protected step = signal<'form' | 'loading' | 'success'>('form');
  protected reference = signal('');

  protected holder = signal('');
  protected number = signal('');
  protected expiry = signal('');
  protected cvv = signal('');
  protected flipped = signal(false);
  protected touched = signal(false);

  protected brand = computed<Brand>(() => {
    const digits = this.number().replace(/\D/g, '');
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    return 'generic';
  });

  protected isAmex = computed(() => this.brand() === 'amex');
  protected numberLength = computed(() => (this.isAmex() ? 15 : 16));
  protected cvvLength = computed(() => (this.isAmex() ? 4 : 3));

  protected maskedNumber = computed(() => {
    const groups = this.isAmex() ? [4, 6, 5] : [4, 4, 4, 4];
    const digits = this.number().replace(/\D/g, '');
    let cursor = 0;
    return groups
      .map(size => {
        const chunk = digits.slice(cursor, cursor + size);
        cursor += size;
        return chunk.padEnd(size, '•');
      })
      .join(' ');
  });

  protected errors = computed(() => ({
    holder: this.holder().trim().length < 3,
    number: this.number().replace(/\D/g, '').length !== this.numberLength(),
    expiry: !this.isFutureExpiry(this.expiry()),
    cvv: this.cvv().length !== this.cvvLength(),
  }));

  protected valid = computed(() => !Object.values(this.errors()).some(Boolean));

  constructor() {
    document.body.classList.add('is-locked');
  }

  ngOnDestroy() {
    document.body.classList.remove('is-locked');
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.step() !== 'loading') this.close.emit();
  }

  protected onNumberInput(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, this.isAmex() || /^3[47]/.test(raw) ? 15 : 16);
    const groups = /^3[47]/.test(digits) ? [4, 6, 5] : [4, 4, 4, 4];

    const parts: string[] = [];
    let cursor = 0;
    for (const size of groups) {
      if (cursor >= digits.length) break;
      parts.push(digits.slice(cursor, cursor + size));
      cursor += size;
    }
    this.number.set(parts.join(' '));
  }

  protected onExpiryInput(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    this.expiry.set(digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }

  protected onCvvInput(raw: string) {
    this.cvv.set(raw.replace(/\D/g, '').slice(0, this.cvvLength()));
  }

  protected pay() {
    this.touched.set(true);
    if (!this.valid()) return;

    const user = this.auth.currentUser();
    if (!user?.id) {
      this.notify.error('Sessione scaduta', 'Effettua di nuovo l\'accesso per completare la prenotazione.');
      return;
    }

    if (!this.room?.id) {
      this.notify.error('Camera non disponibile', 'Ricarica la pagina e riprova.');
      return;
    }

    this.step.set('loading');

    this.bookings
      .create({
        userId: user.id,
        roomId: this.room.id,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        totalPrice: this.totalPrice,
      })
      .subscribe({
        next: booking => {
          this.reference.set(this.buildReference(booking?.id));
          this.step.set('success');
          this.notify.success('Prenotazione confermata', `${this.room?.title} · ${this.nights} notti`);
        },
        error: () => {
          this.step.set('form');
          this.notify.error(
            'Pagamento non riuscito',
            'Il servizio prenotazioni non ha risposto. Controlla la connessione e riprova.',
          );
        },
      });
  }

  protected downloadReceipt() {
    const doc = new jsPDF();
    const brass: [number, number, number] = [168, 130, 60];
    const ink: [number, number, number] = [20, 17, 14];

    doc.setFillColor(...ink);
    doc.rect(0, 0, 210, 46, 'F');

    doc.setFillColor(...brass);
    doc.rect(0, 46, 210, 1.2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('GoldenStay', 20, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(190, 180, 165);
    doc.text('CONFERMA DI PRENOTAZIONE', 20, 34);

    doc.setTextColor(...ink);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Riferimento ${this.reference()}`, 20, 64);

    const rows: [string, string][] = [
      ['Ospite', this.guestName || '—'],
      ['Email', this.email || '—'],
      ['Camera', this.room?.title ?? '—'],
      ['Check-in', this.formatDate(this.checkIn)],
      ['Check-out', this.formatDate(this.checkOut)],
      ['Notti', String(this.nights)],
      ['Ospiti', String(this.guests)],
    ];

    let y = 80;
    doc.setFontSize(10);
    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(133, 122, 110);
      doc.text(label.toUpperCase(), 20, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ink);
      doc.text(value, 75, y);
      doc.setDrawColor(230, 220, 201);
      doc.line(20, y + 3.5, 190, y + 3.5);
      y += 13;
    }

    doc.setFillColor(247, 242, 233);
    doc.rect(20, y + 4, 170, 22, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(133, 122, 110);
    doc.text('TOTALE PAGATO', 27, y + 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...brass);
    doc.text(`${this.totalPrice.toFixed(2)} EUR`, 183, y + 17, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 140, 128);
    doc.text(
      'Lungomare Cristoforo Colombo 12, Tropea (VV) · concierge@goldenstay.it · Ricevimento aperto 24 ore su 24',
      105, 280, { align: 'center' },
    );

    const slug = (this.guestName || 'ospite').trim().replace(/\s+/g, '_');
    doc.save(`GoldenStay_${this.reference()}_${slug}.pdf`);
  }

  private buildReference(id?: number): string {
    const suffix = id ? String(id).padStart(4, '0') : String(Date.now()).slice(-4);
    return `GS-${new Date().getFullYear()}-${suffix}`;
  }

  private formatDate(iso: string): string {
    if (!iso) return '—';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  }

  /** MM/YY valido e non ancora scaduto. */
  private isFutureExpiry(value: string): boolean {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiry = new Date(2000 + Number(match[2]), month, 0);
    return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
