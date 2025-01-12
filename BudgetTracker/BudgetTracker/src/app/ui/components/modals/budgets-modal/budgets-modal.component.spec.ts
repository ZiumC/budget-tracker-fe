import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetsModalComponent } from './budgets-modal.component';

describe('BudgetsModalComponent', () => {
  let component: BudgetsModalComponent;
  let fixture: ComponentFixture<BudgetsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BudgetsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BudgetsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
