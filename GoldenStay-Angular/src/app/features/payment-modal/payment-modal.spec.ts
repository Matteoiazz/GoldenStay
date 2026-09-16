import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PaymentModal } from './payment-modal';

describe('PaymentModal', () => {
  let fixture: ComponentFixture<PaymentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentModal],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentModal);
    fixture.detectChanges();
  });

  it('viene creato', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
