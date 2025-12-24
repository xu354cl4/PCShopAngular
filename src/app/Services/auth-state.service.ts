import { MatDialog } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { ExternalUser } from '../models/external-login-response';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly api = 'https://localhost:7001';
  private userSubject = new BehaviorSubject<ExternalUser | null>(null);
  user$ = this.userSubject.asObservable();

  //avatarUrlSubject 用 BehaviorSubject 是在還沒讀取好的預設圖片
  private avatarUrlSubject = new BehaviorSubject<string | null>(null);
  avatarUrl$ = this.avatarUrlSubject.asObservable();


  constructor() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token && !this.isTokenExpired(token)) {
      this.userSubject.next(JSON.parse(user));
    } else {
      this.clear();
    }
  }
  //上傳刷新Header上的圖片
  setAvatarUrl(url: string) {
    this.avatarUrlSubject.next(url);
  }

  setUser(token: string, user: ExternalUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const avatar =
      user.imageUrl
        ? (user.imageUrl.startsWith('http')
          ? user.imageUrl
          : `${this.api}${user.imageUrl}`)
        : '/images/no-image.png';

    this.avatarUrlSubject.next(avatar);
    this.userSubject.next(user);
  }
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.avatarUrlSubject.next(null);
  }

  get isLoggedIn() {
    return !!this.userSubject.value;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
  markEmailVerified() {
    const user = this.userSubject.value;
    if (!user) return;

    this.userSubject.next({
      ...user,
      isMailVerified: true
    });
  }


  markEmailUnverified() {
    const user = this.userSubject.value;
    if (!user) return;

    this.userSubject.next({
      ...user,
      isMailVerified: false
    });
  }

  updateEmail(mail: string) {
    const user = this.userSubject.value;
    if (!user) return;

    this.userSubject.next({
      ...user,
      mail
    });
  }
  getCurrentUser(): ExternalUser | null {
    return this.userSubject.value;
  }

}
