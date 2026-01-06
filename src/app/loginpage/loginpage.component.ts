import { map } from 'rxjs';
import { routes } from './../app.routes';
import { AfterViewInit, Component } from '@angular/core';
import { GoogleLoginComponent } from '../auth/google-login/google-login.component';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../Services/auth-state.service';
import { AuthService } from '../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

declare const google: any;
@Component({
  selector: 'app-loginpage',
  imports: [GoogleLoginComponent, FormsModule, RouterLink],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css'
})
export class LoginpageComponent implements AfterViewInit {
  errorMessage: string | null = null;

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
    console.log(this.dto)
    this.authService.login(this.dto).subscribe({
      next: res => {
        this.authstate.setUser(res.token, res.user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage =
          err.error?.message ?? '登入失敗，請稍後再試';
      }
    });
  }
}
