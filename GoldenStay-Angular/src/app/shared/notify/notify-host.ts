import { Component, HostListener, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { NotifyService, Tone } from './notify';

@Component({
  selector: 'app-notify-host',
  standalone: true,
  imports: [Icon],
  template: `
    <div class="stack" role="status" aria-live="polite">
      @for (toast of notify.toasts(); track toast.id) {
        <article class="toast" [class]="'toast--' + toast.tone">
          <span class="toast__glyph">
            <app-icon [name]="glyph(toast.tone)" [size]="17" [weight]="1.7" />
          </span>
          <div class="toast__body">
            <p class="toast__title">{{ toast.title }}</p>
            @if (toast.detail) {
              <p class="toast__detail">{{ toast.detail }}</p>
            }
          </div>
          <button class="toast__close" type="button" aria-label="Chiudi avviso"
                  (click)="notify.dismiss(toast.id)">
            <app-icon name="close" [size]="14" />
          </button>
          <span class="toast__timer"></span>
        </article>
      }
    </div>

    @if (notify.pending(); as ask) {
      <div class="veil" (click)="notify.settle(false)">
        <div class="dialog" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <span class="dialog__glyph" [class.dialog__glyph--danger]="ask.danger">
            <app-icon [name]="ask.danger ? 'alert' : 'info'" [size]="22" [weight]="1.6" />
          </span>
          <h2 class="dialog__title">{{ ask.title }}</h2>
          @if (ask.detail) {
            <p class="dialog__detail">{{ ask.detail }}</p>
          }
          <div class="dialog__actions">
            <button class="btn btn--ghost btn--sm" type="button" (click)="notify.settle(false)">
              {{ ask.cancelLabel }}
            </button>
            <button class="btn btn--sm" type="button" [class.btn--danger]="ask.danger"
                    (click)="notify.settle(true)">
              {{ ask.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .stack {
      position: fixed;
      top: 22px;
      right: 22px;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(370px, calc(100vw - 44px));
      pointer-events: none;
    }

    .toast {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 13px;
      padding: 15px 16px;
      overflow: hidden;
      border: 1px solid var(--line-soft);
      border-radius: var(--r-md);
      background: var(--paper);
      box-shadow: var(--lift-3);
      pointer-events: auto;
      animation: toast-in .5s var(--ease-out) both;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(28px) scale(.97); }
      to   { opacity: 1; transform: none; }
    }

    .toast__glyph {
      display: grid;
      place-items: center;
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .toast--success .toast__glyph { background: var(--pine-wash); color: var(--pine); }
    .toast--error   .toast__glyph { background: var(--rust-wash); color: var(--rust); }
    .toast--info    .toast__glyph { background: var(--brass-wash); color: var(--brass-deep); }

    .toast__body { flex: 1; min-width: 0; }

    .toast__title {
      font-size: 14.5px;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast__detail {
      margin-top: 2px;
      font-size: 13px;
      font-weight: 300;
      line-height: 1.5;
      color: var(--text-3);
    }

    .toast__close {
      flex: none;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      margin: -2px -4px 0 0;
      border: 0;
      border-radius: 50%;
      background: none;
      color: var(--text-3);
      transition: background-color .2s, color .2s;
    }

    .toast__close:hover { background: var(--sand); color: var(--text); }

    .toast__timer {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      width: 100%;
      transform-origin: left;
      animation: drain 5s linear both;
    }

    .toast--success .toast__timer { background: var(--pine); }
    .toast--error   .toast__timer { background: var(--rust); }
    .toast--info    .toast__timer { background: var(--brass); }

    @keyframes drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }

    /* ------------------------------------------------------------ dialogo */

    .veil {
      position: fixed;
      inset: 0;
      z-index: 9500;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(20, 17, 14, .55);
      backdrop-filter: blur(6px);
      animation: fade .25s var(--ease) both;
    }

    .dialog {
      width: min(420px, 100%);
      padding: 34px 34px 28px;
      text-align: center;
      border-radius: var(--r-lg);
      background: var(--paper);
      box-shadow: var(--lift-4);
      animation: pop .4s var(--ease-out) both;
    }

    @keyframes pop {
      from { opacity: 0; transform: translateY(18px) scale(.96); }
      to   { opacity: 1; transform: none; }
    }

    .dialog__glyph {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      margin: 0 auto 18px;
      border-radius: 50%;
      background: var(--brass-wash);
      color: var(--brass-deep);
    }

    .dialog__glyph--danger { background: var(--rust-wash); color: var(--rust); }

    .dialog__title { font-size: 1.7rem; }

    .dialog__detail {
      margin-top: 10px;
      font-size: 14.5px;
      font-weight: 300;
      line-height: 1.6;
      color: var(--text-2);
    }

    .dialog__actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 26px;
    }

    @media (max-width: 480px) {
      .stack { top: 14px; right: 14px; width: calc(100vw - 28px); }
      .dialog__actions { flex-direction: column-reverse; }
      .dialog__actions .btn { width: 100%; }
    }
  `],
})
export class NotifyHost {
  protected notify = inject(NotifyService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.notify.pending()) this.notify.settle(false);
  }

  protected glyph(tone: Tone): string {
    return tone === 'success' ? 'checkCircle' : tone === 'error' ? 'xCircle' : 'info';
  }
}
