import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MemberApiService } from '../../Services/member-api.service';
import { AuthStateService } from '../../Services/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-wrapper">
      <h2>Email 驗證</h2>

      <p *ngIf="loading">驗證中，請稍候...</p>
      <p *ngIf="success" class="success">✅ 驗證成功</p>
      <p *ngIf="error" class="error">{{ error }}</p>

      <a *ngIf="success" routerLink="/membercenter">
        前往會員中心
      </a>
    </div>
  `,
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {

  loading = true;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: MemberApiService,
    private authState: AuthStateService,
    private router : Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.error = '驗證連結無效';
      return;
    }

    this.api.confirmVerifyEmail(token).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        // ⭐ 這一行只負責「前端狀態同步」
        this.authState.markEmailVerified();
        this.router.navigate(['/membercenter']);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message ?? '驗證失敗';
      }
    });
  }
}
