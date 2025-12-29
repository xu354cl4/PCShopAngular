import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberOrderHistoryComponent } from './member-order-history.component';

describe('MemberOrderHistoryComponent', () => {
  let component: MemberOrderHistoryComponent;
  let fixture: ComponentFixture<MemberOrderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberOrderHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberOrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
