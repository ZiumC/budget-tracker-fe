import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeModalComponent } from './income-modal.component';

describe('IncomeComponent', () => {
  let component: IncomeModalComponent;
  let fixture: ComponentFixture<IncomeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
