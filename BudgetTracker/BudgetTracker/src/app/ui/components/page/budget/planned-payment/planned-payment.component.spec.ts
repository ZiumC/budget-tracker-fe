import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedPaymentComponent } from './planned-payment.component';

describe('PlannedPaymentComponent', () => {
  let component: PlannedPaymentComponent;
  let fixture: ComponentFixture<PlannedPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlannedPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlannedPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
