import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-resetpage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resetpage.component.html',
  styleUrl: './resetpage.component.css'
})
export class ResetpageComponent implements OnInit {
  mode: 'request' | 'reset' | 'verify' = 'request';
  mail = '';
  newPassword = '';
  confirmPassword = '';
  token: string | null = null;

  message: string | null = null;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const action = this.route.snapshot.routeConfig?.path;

    if (action === 'reset-password' && token) {
      this.mode = 'reset';
      this.token = token;
    } else if (action === 'verify-email' && token) {
      this.mode = 'verify';
      this.token = token;
      this.verifyEmail();
    } else {
      this.mode = 'request';
    }
  }

  sendResetMail() {
    this.resetMsg();
    this.loading = true;

    this.authService.forgotPassword(this.mail).subscribe({
      next: res => {
        this.message = res.message ?? '如果帳號存在，已寄出信件';
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err.error?.message ?? '寄送失敗';
        this.loading = false;
      }
    });
  }

  resetPassword() {
    this.resetMsg();

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = '兩次密碼不一致';
      return;
    }

    this.authService
      .resetPassword(this.token!, this.newPassword)
      .subscribe({
        next: res => {
          this.message = res.message ?? '密碼已更新';
        },
        error: err => {
          this.errorMessage = err.error?.message ?? '重設失敗';
        }
      });
  }

  verifyEmail() {
    this.authService.verifyEmail(this.token!).subscribe({
      next: res => {
        this.message = res.message ?? '驗證成功';
      },
      error: err => {
        this.errorMessage = err.error?.message ?? '驗證失敗';
      }
    });
  }

  resetMsg() {
    this.message = null;
    this.errorMessage = null;
  }
}
