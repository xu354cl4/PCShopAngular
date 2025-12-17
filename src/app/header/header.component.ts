import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthStateService } from '../Services/auth-state.service';
import { Observable } from 'rxjs';
import { ExternalUser } from '../models/external-login-response';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {


 user$!: Observable<ExternalUser | null>;  // ⭐ 先宣告，不初始化

  constructor(private authState: AuthStateService) {
    this.user$ = this.authState.user$;      // ⭐ 這裡再接
  }

  logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.authState.clear();
}
}
