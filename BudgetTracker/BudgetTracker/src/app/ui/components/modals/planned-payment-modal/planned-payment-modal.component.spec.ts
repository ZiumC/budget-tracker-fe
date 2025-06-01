import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedPaymentModalComponent } from './planned-payment-modal.component';

describe('PlannedPaymentsModalComponent', () => {
  let component: PlannedPaymentModalComponent;
  let fixture: ComponentFixture<PlannedPaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlannedPaymentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannedPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
