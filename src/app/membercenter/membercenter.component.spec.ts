import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembercenterComponent } from './membercenter.component';

describe('MembercenterComponent', () => {
  let component: MembercenterComponent;
  let fixture: ComponentFixture<MembercenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembercenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembercenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
