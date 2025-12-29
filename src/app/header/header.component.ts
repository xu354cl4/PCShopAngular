import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthStateService } from '../Services/auth-state.service';
import { Observable } from 'rxjs';
import { ExternalUser } from '../models/external-login-response';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  avatarUrl$!: Observable<string | null>;
  user$!: Observable<ExternalUser | null>;  // ⭐ 先宣告，不初始化
  role = '';
  constructor(private authState: AuthStateService, private router: Router,) {
    this.user$ = this.authState.user$;      // ⭐ 這裡再接
    this.avatarUrl$ = this.authState.avatarUrl$;

  }
  ngOnInit(): void {

  }

  goRegister() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.authState.clear();   // ⭐ 非常重要
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authState.clear();
    this.router.navigate(['home']);
  }
}
