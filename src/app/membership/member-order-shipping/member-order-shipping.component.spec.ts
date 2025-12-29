import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrderShippingComponent } from './member-order-shipping.component';

describe('MemberOrderShippingComponent', () => {
  let component: MemberOrderShippingComponent;
  let fixture: ComponentFixture<MemberOrderShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberOrderShippingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberOrderShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
