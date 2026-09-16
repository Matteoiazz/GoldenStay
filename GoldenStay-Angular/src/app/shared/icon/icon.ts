import { Component, Input } from '@angular/core';

/**
 * Set di icone lineari disegnate sulla stessa griglia 24x24 e sullo stesso
 * spessore di tratto, così da restare coerenti ovunque vengano usate.
 * Ogni voce è la lista dei path che compongono il simbolo.
 */
const GLYPHS: Record<string, string[]> = {
  search: ['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0', 'M16.5 16.5 21 21'],
  calendar: [
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    'M8 3v4', 'M16 3v4', 'M3 10h18',
  ],
  guests: [
    'M13 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
    'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M22 20v-2a4 4 0 0 0-3-3.87', 'M16 3.6a4 4 0 0 1 0 6.8',
  ],
  arrowRight: ['M4 12h15', 'M13 6l6 6-6 6'],
  arrowLeft: ['M20 12H5', 'M11 18l-6-6 6-6'],
  chevronDown: ['M6 9.5l6 6 6-6'],
  chevronRight: ['M9.5 6l6 6-6 6'],
  check: ['M4 12.5l5 5L20 6.5'],
  checkCircle: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M8 12.4l2.8 2.8L16.4 9.6'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  xCircle: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M9 9l6 6', 'M15 9l-6 6'],
  alert: ['M12 3.2 21.4 20H2.6z', 'M12 9.5v4.5', 'M12 17.2v.01'],
  info: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 11.5V16', 'M12 8.2v.01'],
  trash: ['M4 7h16', 'M9.5 11v6', 'M14.5 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M14.5 5.5l4 4'],
  plus: ['M12 5v14', 'M5 12h14'],
  wifi: [
    'M2.5 9a15 15 0 0 1 19 0', 'M5.5 12.5a10.5 10.5 0 0 1 13 0',
    'M8.5 16a6 6 0 0 1 7 0', 'M12 19.4v.01',
  ],
  coffee: [
    'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z',
    'M17 9h1.5a2.5 2.5 0 0 1 0 5H17', 'M7 2v3', 'M11 2v3', 'M15 2v3',
  ],
  sparkle: [
    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    'M18.4 15.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z',
  ],
  shield: ['M12 3l8 3v6c0 5-3.5 8.3-8 9.5C7.5 20.3 4 17 4 12V6z', 'M9.2 12l2 2 3.6-3.6'],
  star: ['M12 3.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8z'],
  bed: [
    'M3 8v11', 'M21 19v-6a3 3 0 0 0-3-3H3', 'M3 14h18',
    'M9.25 9.2a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0',
  ],
  pin: [
    'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z',
    'M14.6 10a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0',
  ],
  lock: ['M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M8 10V7a4 4 0 0 1 8 0v3'],
  mail: ['M4.5 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M3 7.5l9 6 9-6'],
  user: ['M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0', 'M20 20.5v-1.5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1.5'],
  eye: ['M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  eyeOff: [
    'M4 4l16 16', 'M9.9 5.7A9.9 9.9 0 0 1 12 5.5c6.2 0 10 6.5 10 6.5a17.3 17.3 0 0 1-3.4 4.1',
    'M6.6 7.8A16.7 16.7 0 0 0 2 12s3.8 6.5 10 6.5c1.3 0 2.6-.3 3.7-.8',
    'M10.1 10.3a2.6 2.6 0 0 0 3.6 3.6',
  ],
  card: [
    'M5 5h14a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 5 5z',
    'M2.5 10h19', 'M6.5 15h3',
  ],
  download: ['M12 3.5v11.5', 'M7.5 10.5l4.5 4.5 4.5-4.5', 'M4 20h16'],
  refresh: ['M20.5 12a8.5 8.5 0 1 1-2.6-6.1', 'M20.5 4v5H15.5'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  logout: ['M14 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8', 'M17.5 8l4 4-4 4', 'M21.5 12H10'],
  layers: ['M12 3l9 5-9 5-9-5z', 'M3 13l9 5 9-5', 'M3 17.5l9 5 9-5'],
  chart: ['M4 20h17', 'M7 20v-8', 'M12 20V5.5', 'M17 20v-6'],
  key: ['M12 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0', 'M10.9 12.1L20 3', 'M17.5 5.5l2.5 2.5', 'M15 8l2 2'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 7v5.4l3.4 2'],
  receipt: ['M6 2.5h12v19l-3-2-3 2-3-2-3 2z', 'M9.5 8.5h5', 'M9.5 12.5h5'],
  waves: [
    'M2 7.5c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0',
    'M2 12.5c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0',
    'M2 17.5c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0',
  ],
  sliders: [
    'M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9',
    'M17 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0', 'M11 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  ],
  crown: ['M4 18.5h16', 'M4 15.5l-1.5-8.5L8 11l4-6.8L16 11l5.5-4-1.5 8.5z'],
  home: ['M3.5 11L12 4l8.5 7', 'M6 9.6V20h12V9.6'],
  instagram: [
    'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5z',
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0', 'M17.2 6.9v.01',
  ],
  facebook: ['M13.5 22v-8.5H16.4l.6-3.5h-3.5V8a1.2 1.2 0 0 1 1.3-1.3H17V3.6a18 18 0 0 0-2.6-.2c-2.6 0-4.4 1.6-4.4 4.6V10H7v3.5h3V22'],
  linkedin: [
    'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z',
    'M8 10.5V17', 'M8 7.4v.01', 'M12 17v-3.8a2.2 2.2 0 0 1 4.4 0V17',
  ],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" [attr.stroke-width]="weight"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @for (d of paths; track $index) {
        <path [attr.d]="d"></path>
      }
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; line-height: 0; }
    svg { display: block; }
  `],
})
export class Icon {
  @Input({ required: true }) set name(value: string) {
    this.paths = GLYPHS[value] ?? [];
  }

  @Input() size = 20;
  @Input() weight = 1.5;

  protected paths: string[] = [];
}
