import { Component } from '@angular/core';
import { GoogleLoginComponent } from '../auth/google-login/google-login.component';
import { HttpClient } from '@angular/common/http';

declare const google: any;
@Component({
  selector: 'app-loginpage',
  imports: [GoogleLoginComponent],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css'
})
export class LoginpageComponent {

  constructor(private httpclient: HttpClient) {

  }
  num = 1;
  selectedPanel: string = 'overview'; // 預設帳戶總覽


  selectPanel(panel: string) {
    this.selectedPanel = panel;
  }
  onGoogleLogin() {
    console.log("🔥 手動呼叫 Google 登入");
    google.accounts.id.prompt();
  }

  sumbit() {

  }
}
