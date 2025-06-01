import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyPaymentModalComponent } from './copy-payment-modal.component';

describe('CopyPaymentModalComponent', () => {
  let component: CopyPaymentModalComponent;
  let fixture: ComponentFixture<CopyPaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyPaymentModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CopyPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
