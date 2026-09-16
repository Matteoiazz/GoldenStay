/**
 * Pattern Strategy per il calcolo del prezzo di un soggiorno.
 * Ogni tariffa è una classe a sé: aggiungerne una non tocca le altre.
 */
export interface PricingStrategy {
  calculate(pricePerNight: number, nights: number): number;
  getName(): string;
}

/** Prezzo di listino, senza variazioni. */
export class StandardPricingStrategy implements PricingStrategy {
  calculate(pricePerNight: number, nights: number): number {
    return pricePerNight * nights;
  }

  getName(): string {
    return 'Tariffa Standard';
  }
}

/** Alta stagione: agosto sulla costa vale una maggiorazione del 20%. */
export class AugustPricingStrategy implements PricingStrategy {
  calculate(pricePerNight: number, nights: number): number {
    return pricePerNight * nights * 1.2;
  }

  getName(): string {
    return 'Tariffa Agosto (+20%)';
  }
}

/** Soggiorni che comprendono la notte del venerdì o del sabato. */
export class WeekendStrategy implements PricingStrategy {
  calculate(pricePerNight: number, nights: number): number {
    return pricePerNight * nights * 1.2;
  }

  getName(): string {
    return 'Tariffa Weekend (+20%)';
  }
}

/** Oltre le sette notti si applica uno sconto del 15% sull'intero soggiorno. */
export class LongStayDiscountStrategy implements PricingStrategy {
  calculate(pricePerNight: number, nights: number): number {
    const total = pricePerNight * nights;
    return nights > 7 ? total * 0.85 : total;
  }

  getName(): string {
    return 'Sconto Soggiorno Lungo (-15%)';
  }
}
