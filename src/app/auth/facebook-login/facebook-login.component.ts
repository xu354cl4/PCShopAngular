import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

declare const FB: any;
@Component({
  selector: 'app-facebook-login',
  standalone: true,
  imports: [],
  template: `
    <button (click)="loginWithFacebook()">使用 Facebook 登入</button>
  `,
  templateUrl: './facebook-login.component.html',
  styleUrl: './facebook-login.component.css'
})
export class FacebookLoginComponent {
 constructor(private authService: AuthService) {}

  loginWithFacebook() {
    FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;

        this.authService.loginWithFacebook(accessToken).subscribe({
          next: (res) => {
            localStorage.setItem("token", res.jwtToken);
            console.log("Facebook 登入成功");
          },
          error: (err) => console.error("登入錯誤:", err)
        });
      }
    }, { scope: 'email,public_profile' });
  }
}

