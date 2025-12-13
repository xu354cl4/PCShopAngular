import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
@Component({
  selector: 'app-line-login',
  imports: [],
   standalone: true,
  template: `
    <button (click)="login()">使用 LINE 登入</button>
  `,
  templateUrl: './line-login.component.html',
  styleUrl: './line-login.component.css'
})
export class LineLoginComponent {
 constructor(private authService: AuthService) {}

  login() {
    const clientId = "你的 LINE ClientId";
    const redirectUri = encodeURIComponent("http://localhost:4200/line-callback");
    const state = crypto.randomUUID();
    const scope = "profile openid email";

    window.location.href =
      `https://access.line.me/oauth2/v2.1/authorize?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}` +
      `&scope=${scope}`;
  }
}
