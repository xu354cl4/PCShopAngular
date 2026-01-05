import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberBenefitsFootprintsComponent } from './member-benefits-footprints.component';

describe('MemberBenefitsFootprintsComponent', () => {
  let component: MemberBenefitsFootprintsComponent;
  let fixture: ComponentFixture<MemberBenefitsFootprintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberBenefitsFootprintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberBenefitsFootprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
