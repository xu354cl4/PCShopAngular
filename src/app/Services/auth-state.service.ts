import { Injectable } from '@angular/core';
import { ExternalUser } from '../models/external-login-response';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userSubject = new BehaviorSubject<ExternalUser | null>(null);
  user$ = this.userSubject.asObservable();


  constructor() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token && !this.isTokenExpired(token)) {
      this.userSubject.next(JSON.parse(user));
    } else {
      this.clear();
    }
  }


  setUser(token: string, user: ExternalUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
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
}
