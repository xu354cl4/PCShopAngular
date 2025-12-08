import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFloppybirdComponent } from './game-floppybird.component';

describe('GameFloppybirdComponent', () => {
  let component: GameFloppybirdComponent;
  let fixture: ComponentFixture<GameFloppybirdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFloppybirdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameFloppybirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
