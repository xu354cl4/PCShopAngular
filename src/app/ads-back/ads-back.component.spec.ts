import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsBackComponent } from './ads-back.component';

describe('AdsBackComponent', () => {
  let component: AdsBackComponent;
  let fixture: ComponentFixture<AdsBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsBackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdsBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
