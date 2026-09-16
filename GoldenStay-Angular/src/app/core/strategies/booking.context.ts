import { PricingStrategy } from './price.strategy';

/**
 * Context del pattern Strategy: conosce l'interfaccia della strategia ma non
 * la sua implementazione, e permette di sostituirla a runtime.
 */
export class BookingContext {
  private strategy: PricingStrategy;

  constructor(initialStrategy: PricingStrategy) {
    this.strategy = initialStrategy;
  }

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  getStrategyName(): string {
    return this.strategy.getName();
  }

  executeCalculation(pricePerNight: number, nights: number): number {
    return this.strategy.calculate(pricePerNight, nights);
  }
}
