import { Injectable } from '@angular/core';
import { ExternalUser } from '../models/external-login-response';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  constructor() { }

   private userSubject = new BehaviorSubject<ExternalUser | null>(null);
   user$ = this.userSubject.asObservable();

  setUser(user: ExternalUser) {
    this.userSubject.next(user);
  }

  clear() {
    this.userSubject.next(null);
  }
}
