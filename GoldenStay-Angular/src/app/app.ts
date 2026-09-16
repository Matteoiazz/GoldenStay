import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { NotifyHost } from './shared/notify/notify-host';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, NotifyHost],
  template: `
    <div class="app-layout">
      @if (!isBackoffice()) {
        <app-navbar />
      }

      <main class="content">
        <router-outlet />
      </main>

      @if (!isBackoffice()) {
        <app-footer />
      }
    </div>

    <app-notify-host />
  `,
})
export class App {
  private router = inject(Router);

  /** Le pagine di back office hanno una loro impaginazione e non usano il footer. */
  protected isBackoffice = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => this.isBackoffice.set(this.isAdminUrl(event.urlAfterRedirects)));
  }

  private isAdminUrl(url: string): boolean {
    return url.startsWith('/admin') || url.startsWith('/create-room');
  }
}
