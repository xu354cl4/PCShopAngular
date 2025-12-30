import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsPlaygroundComponent } from './ads-playground.component';

describe('AdsPlaygroundComponent', () => {
  let component: AdsPlaygroundComponent;
  let fixture: ComponentFixture<AdsPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsPlaygroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdsPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
