import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeheadCategoryComponent } from './typehead-category.component';

describe('TypeheadCategoryComponent', () => {
  let component: TypeheadCategoryComponent;
  let fixture: ComponentFixture<TypeheadCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeheadCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeheadCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
