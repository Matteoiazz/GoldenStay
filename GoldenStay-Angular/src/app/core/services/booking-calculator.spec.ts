import { TestBed } from '@angular/core/testing';

import { BookingCalculator } from './booking-calculator';

describe('BookingCalculator', () => {
  let calculator: BookingCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    calculator = TestBed.inject(BookingCalculator);
  });

  it('applica il listino a un soggiorno infrasettimanale', () => {
    // Lunedì → mercoledì 2025: nessun weekend, nessuno sconto.
    const quote = calculator.quote(100, '2025-11-03', '2025-11-05');

    expect(quote.nights).toBe(2);
    expect(quote.total).toBe(200);
    expect(quote.saving).toBe(0);
    expect(quote.tariff).toBe('Tariffa Standard');
  });

  it('maggiora del 20% i soggiorni che toccano il weekend', () => {
    // Venerdì → domenica.
    const quote = calculator.quote(100, '2025-11-07', '2025-11-09');

    expect(quote.total).toBeCloseTo(240, 5);
    expect(quote.surcharge).toBeTrue();
  });

  it('sconta del 15% oltre le sette notti', () => {
    const quote = calculator.quote(100, '2025-11-03', '2025-11-13');

    expect(quote.nights).toBe(10);
    expect(quote.total).toBeCloseTo(850, 5);
    expect(quote.saving).toBeCloseTo(150, 5);
  });

  it('dà la precedenza alla tariffa di agosto', () => {
    const quote = calculator.quote(100, '2025-08-01', '2025-08-15');

    expect(quote.tariff).toContain('Agosto');
    expect(quote.total).toBeCloseTo(1680, 5);
  });

  it('restituisce un preventivo vuoto se le date non sono valide', () => {
    expect(calculator.quote(100, '2025-11-10', '2025-11-10').nights).toBe(0);
    expect(calculator.quote(100, '', '').total).toBe(0);
  });
});
