import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
@Component({
  selector: 'app-line-callback',
  imports: [],
   standalone: true,
  template: `LINE Login 處理中...`,
  templateUrl: './line-callback.component.html',
  styleUrl: './line-callback.component.css'
})
export class LineCallbackComponent implements OnInit{
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    const code = new URL(location.href).searchParams.get("code");

    if (!code) return;

    // 從 LINE 拿 token (需要你在後端代理比較安全)
    const tokenResp: any = await this.http.post(
      "https://api.line.me/oauth2/v2.1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:4200/line-callback",
        client_id: "你的 LINE ClientId",
        client_secret: "你的 LINE Secret"
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }}
    ).toPromise();

    const idToken = tokenResp.id_token;

    this.auth.loginWithLine(idToken).subscribe({
      next: res => {
        console.log("LINE 登入成功");
        localStorage.setItem("token", res.jwtToken);
      }
    });
  }
}

