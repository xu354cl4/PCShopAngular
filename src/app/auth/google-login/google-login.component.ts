import { CompleteProfileRequest } from './../../models/CompleteProfileRequest';
import { ExternalUser } from './../../models/external-login-response';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { AuthStateService } from '../../Services/auth-state.service';

declare const google: any;

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="googleBtn"></div>`,
  styleUrls: ['./google-login.component.css']
})
export class GoogleLoginComponent implements AfterViewInit {


  constructor(
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService
  ) { }

  ngAfterViewInit(): void {

    google.accounts.id.initialize({
      client_id: '723650639666-j48h85hrq6agvd0225gkvcfpi7k9nhr8.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'outline',
        size: 'large'
      }
    );
  }

  handleGoogleCredential(response: any): void {
    const idToken = response.credential;
    console.log('✅ Google Id Token:', idToken);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: (res) => {
        console.log('✅ Google 登入成功', res);

        // ⚠️ 注意：你的後端回傳是 token，不是 jwtToken
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        this.authState.setUser(res.token, res.user);
        // ✅ 登入成功後導到首頁（或你要的頁面）
        if (!res.user.profileCompleted) {
          // ⭐ 尚未補齊資料
          this.router.navigate(['/register']);
          this.authService.pendingGoogleUser = res.user;
        } else {
          // ⭐ 已完成
          this.router.navigate(['/home']);
        }
      },
      error: err => console.error(err)
    });
  }
}
