import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth';
import { NotifyService } from '../../shared/notify/notify';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotifyService);

  /** Sulla home l'header galleggia sopra l'immagine finché non si scorre. */
  protected onHome = signal(true);
  protected scrolled = signal(false);
  protected menuOpen = signal(false);
  protected drawerOpen = signal(false);

  protected transparent = computed(() => this.onHome() && !this.scrolled() && !this.drawerOpen());

  protected initials = computed(() => {
    const name = this.auth.currentUser()?.name?.trim();
    if (!name) return 'GS';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  });

  protected isAdmin = computed(() => this.auth.currentUser()?.role?.toUpperCase() === 'ADMIN');

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        this.onHome.set(event.urlAfterRedirects === '/');
        this.closeAll();
      });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.menuOpen() && !target.closest('.account')) this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeAll();
  }

  protected toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  protected toggleDrawer() {
    const next = !this.drawerOpen();
    this.drawerOpen.set(next);
    document.body.classList.toggle('is-locked', next);
  }

  protected closeAll() {
    this.menuOpen.set(false);
    this.drawerOpen.set(false);
    document.body.classList.remove('is-locked');
  }

  protected logout() {
    const name = this.auth.currentUser()?.name;
    this.closeAll();
    this.auth.logout();
    this.notify.info('Sessione chiusa', name ? `A presto, ${name}.` : undefined);
  }
}
