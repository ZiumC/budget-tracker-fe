import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedPaymentsModalComponent } from './planned-payments-modal.component';

describe('PlannedPaymentsModalComponent', () => {
  let component: PlannedPaymentsModalComponent;
  let fixture: ComponentFixture<PlannedPaymentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlannedPaymentsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlannedPaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
