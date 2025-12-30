import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdsVisibilityService {
  // ✅ 使用者按叉叉後：本次 SPA 期間都隱藏；重新整理才會重置
  private dismissed$ = new BehaviorSubject(false);

  // ✅ GameHome 開啟期間要隱藏
  private gameHomeOpen$ = new BehaviorSubject(false);

  floatVisible$ = combineLatest([this.dismissed$, this.gameHomeOpen$]).pipe(
    map(([dismissed, gameOpen]) => !dismissed && !gameOpen)
  );

  dismissFloat() {
    this.dismissed$.next(true);
  }

  setGameHomeOpen(isOpen: boolean) {
    this.gameHomeOpen$.next(isOpen);
  }
}
