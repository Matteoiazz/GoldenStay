import { Injectable } from '@angular/core';

import {
  AugustPricingStrategy,
  LongStayDiscountStrategy,
  PricingStrategy,
  StandardPricingStrategy,
  WeekendStrategy,
} from '../strategies/price.strategy';
import { countNights } from './room.service';

export interface Quote {
  nights: number;
  /** Totale con la tariffa più conveniente applicabile. */
  total: number;
  /** Totale a tariffa piena, usato per il prezzo barrato. */
  standard: number;
  tariff: string;
  /** Differenza positiva solo quando la tariffa applicata sconta. */
  saving: number;
  surcharge: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookingCalculator {
  calculateTotal(strategy: PricingStrategy, pricePerNight: number, checkIn: string, checkOut: string): number {
    const nights = countNights(checkIn, checkOut);
    return nights > 0 ? strategy.calculate(pricePerNight, nights) : 0;
  }

  /**
   * Preventivo completo: notti, totale applicato, totale a listino e nome
   * della tariffa. È l'unico punto in cui si decide quanto costa un soggiorno.
   */
  quote(pricePerNight: number, checkIn: string, checkOut: string): Quote {
    const nights = countNights(checkIn, checkOut);
    if (nights === 0) {
      return { nights: 0, total: 0, standard: 0, tariff: '', saving: 0, surcharge: false };
    }

    const strategy = this.getBestStrategy(checkIn, checkOut);
    const total = strategy.calculate(pricePerNight, nights);
    const standard = new StandardPricingStrategy().calculate(pricePerNight, nights);

    return {
      nights,
      total,
      standard,
      tariff: strategy.getName(),
      saving: Math.max(0, standard - total),
      surcharge: total > standard,
    };
  }

  /**
   * Priorità: alta stagione di agosto, poi lo sconto lungo soggiorno,
   * poi la maggiorazione weekend, infine il listino.
   */
  getBestStrategy(checkIn: string, checkOut: string): PricingStrategy {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start.getMonth() === 7 || end.getMonth() === 7) {
      return new AugustPricingStrategy();
    }

    if (countNights(checkIn, checkOut) > 7) {
      return new LongStayDiscountStrategy();
    }

    if (this.hasWeekend(start, end)) {
      return new WeekendStrategy();
    }

    return new StandardPricingStrategy();
  }

  /** Vero se il soggiorno comprende la notte del venerdì o del sabato. */
  private hasWeekend(start: Date, end: Date): boolean {
    const cursor = new Date(start);
    while (cursor < end) {
      const day = cursor.getDay();
      if (day === 5 || day === 6) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  }
}
