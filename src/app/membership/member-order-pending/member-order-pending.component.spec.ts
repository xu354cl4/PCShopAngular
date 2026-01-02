import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrderPendingComponent } from './member-order-pending.component';

describe('MemberOrderPendingComponent', () => {
  let component: MemberOrderPendingComponent;
  let fixture: ComponentFixture<MemberOrderPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberOrderPendingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberOrderPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
