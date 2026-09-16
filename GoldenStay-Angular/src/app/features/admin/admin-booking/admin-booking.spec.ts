import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminBookingsComponent } from './admin-booking';

describe('AdminBookingsComponent', () => {
  let fixture: ComponentFixture<AdminBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBookingsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBookingsComponent);
    fixture.detectChanges();
  });

  it('viene creato', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
