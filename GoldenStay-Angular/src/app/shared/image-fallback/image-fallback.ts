import { Directive, HostBinding, HostListener } from '@angular/core';

/**
 * Alcune immagini arrivano dal database con indirizzi non validi. Invece di
 * mostrare l'icona di immagine rotta del browser, nascondiamo l'elemento e
 * lasciamo emergere lo sfondo decorativo del contenitore.
 */
@Directive({
  selector: 'img[appImageFallback]',
  standalone: true,
})
export class ImageFallback {
  @HostBinding('class.is-broken') broken = false;

  @HostListener('error')
  onError() {
    this.broken = true;
  }

  @HostListener('load')
  onLoad() {
    this.broken = false;
  }
}
