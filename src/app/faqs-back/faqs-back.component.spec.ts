import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsBackComponent } from './faqs-back.component';

describe('FaqsBackComponent', () => {
  let component: FaqsBackComponent;
  let fixture: ComponentFixture<FaqsBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqsBackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqsBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
