import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthStateService } from "../Services/auth-state.service";

// profile-complete.guard.ts
@Injectable({ providedIn: 'root' })
export class ProfileCompleteGuard implements CanActivate {

  constructor(
    private authState: AuthStateService,
    private router: Router
  ) { }

  canActivate(): boolean {
    // 沒登入 → 走你原本的 auth guard
    if (!this.authState.isLoggedIn) {
      alert("請先登入")
      this.router.navigate(['/loginpage']);
      return false;
    }

    // 已登入但資料未完成 → 強制補資料
    if (!this.authState.isProfileCompleted) {
      alert("請先補全資料")
      this.router.navigate(['/register']);
      return false;
    }

    // OK
    return true;
  }
}
