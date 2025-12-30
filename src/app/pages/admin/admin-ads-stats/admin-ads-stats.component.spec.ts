import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAdsStatsComponent } from './admin-ads-stats.component';

describe('AdminAdsStatsComponent', () => {
  let component: AdminAdsStatsComponent;
  let fixture: ComponentFixture<AdminAdsStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAdsStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAdsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
