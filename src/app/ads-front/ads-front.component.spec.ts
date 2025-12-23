import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsFrontComponent } from './ads-front.component';

describe('AdsFrontComponent', () => {
  let component: AdsFrontComponent;
  let fixture: ComponentFixture<AdsFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsFrontComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdsFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
