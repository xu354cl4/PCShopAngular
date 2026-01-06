import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberBenefitsCoinComponent } from './member-benefits-coin.component';

describe('MemberBenefitsCoinComponent', () => {
  let component: MemberBenefitsCoinComponent;
  let fixture: ComponentFixture<MemberBenefitsCoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberBenefitsCoinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberBenefitsCoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
