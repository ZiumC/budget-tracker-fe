import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorViewComponent } from './error-view.component';

describe('ModalErrorComponent', () => {
  let component: ErrorViewComponent;
  let fixture: ComponentFixture<ErrorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
