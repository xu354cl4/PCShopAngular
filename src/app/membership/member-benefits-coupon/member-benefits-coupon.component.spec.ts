import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberBenefitsCouponComponent } from './member-benefits-coupon.component';

describe('MemberBenefitsCouponComponent', () => {
  let component: MemberBenefitsCouponComponent;
  let fixture: ComponentFixture<MemberBenefitsCouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberBenefitsCouponComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberBenefitsCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
