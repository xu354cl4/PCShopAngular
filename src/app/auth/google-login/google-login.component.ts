import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';

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
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    console.log('🔥 GoogleLoginComponent ngAfterViewInit');

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

        // ✅ 登入成功後導到首頁（或你要的頁面）
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('❌ Google 登入失敗', err);
      }
    });
  }
}
