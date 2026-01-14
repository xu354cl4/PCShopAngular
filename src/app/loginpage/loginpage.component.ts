import { map } from 'rxjs';
import { routes } from './../app.routes';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GoogleLoginComponent } from '../auth/google-login/google-login.component';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../Services/auth-state.service';
import { AuthService } from '../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

declare const google: any;
@Component({
  selector: 'app-loginpage',
  imports: [GoogleLoginComponent, FormsModule, RouterLink, CommonModule],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css'
})
export class LoginpageComponent implements AfterViewInit, OnInit {
  errorMessage: string | null = null;
  captchaText = '';
  captchaInput = '';
  captchaError = '';
  constructor(private httpclient: HttpClient, private authstate: AuthStateService, private authService: AuthService, private router: Router) {

  }
  ngAfterViewInit() {
    setTimeout(() => {
      document
        .querySelector('.google-login-wrapper')
        ?.classList.add('ready');
    }, 300);
  }
  dto = {
    Mail: '',
    Password: ''
  }

  ngOnInit() {
    this.generateCaptcha();
  }

  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captchaText = Array.from({ length: 5 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
    this.captchaInput = '';
    this.captchaError = '';
  }

  private validateCaptchaOrFail(): boolean {
    const input = (this.captchaInput ?? '').trim().toUpperCase();
    const expected = (this.captchaText ?? '').trim().toUpperCase();

    this.errorMessage = '';

    if (!input) {
      this.errorMessage = '請輸入驗證碼';
      return false;
    }

    if (input !== expected) {
      this.errorMessage = '驗證碼錯誤，請重新輸入';
      this.generateCaptcha(); // 錯就重產
      return false;
    }

    return true;
  }


  num = 1;
  selectedPanel: string = 'overview'; // 預設帳戶總覽

  goRegister() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.authstate.clear();   // ⭐ 非常重要
  }
  goForgotpassword() {
    this.router.navigate(['forgot-password']);
  }

  selectPanel(panel: string) {
    this.selectedPanel = panel;
  }
  onGoogleLogin() {
    google.accounts.id.prompt();
  }

  submit() {
    if (!this.validateCaptchaOrFail()) return;
    this.authService.login(this.dto).subscribe({
      next: res => {
        this.authstate.setUser(res.token, res.user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage =
          err.error?.message ?? '登入失敗，請稍後再試';
        this.generateCaptcha();
      }
    });
  }
}
