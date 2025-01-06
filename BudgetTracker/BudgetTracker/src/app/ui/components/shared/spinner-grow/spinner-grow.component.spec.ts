import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerGrowComponent } from './spinner-grow.component';

describe('SpinnerGrowComponent', () => {
  let component: SpinnerGrowComponent;
  let fixture: ComponentFixture<SpinnerGrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpinnerGrowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpinnerGrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
