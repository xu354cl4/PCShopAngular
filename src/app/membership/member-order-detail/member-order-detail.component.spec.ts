import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrderDetailComponent } from './member-order-detail.component';

describe('MemberOrderDetailComponent', () => {
  let component: MemberOrderDetailComponent;
  let fixture: ComponentFixture<MemberOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberOrderDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
