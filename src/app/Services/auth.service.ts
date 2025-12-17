import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompleteProfileRequest } from './../models/CompleteProfileRequest';
import { ExternalLoginResponse } from '../models/external-login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7001/api/Auth'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }
  pendingGoogleUser: any = null;
  loginWithGoogle(idToken: string) {
    return this.http.post<ExternalLoginResponse>(`${this.apiUrl}/google-login`, {
      idToken
    });
  }

  loginWithFacebook(accessToken: string): Observable<ExternalLoginResponse> {
    return this.http.post<ExternalLoginResponse>(`${this.apiUrl}/external-login`, {
      provider: 'facebook',
      accessToken: accessToken,
    });
  }

  loginWithLine(idToken: string): Observable<ExternalLoginResponse> {
    return this.http.post<ExternalLoginResponse>(`${this.apiUrl}/external-login`, {
      provider: 'line',
      idToken: idToken,
    });
  }

  completeProfile(dto: CompleteProfileRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/complete-profile`, dto);
  }

  register(dto: CompleteProfileRequest & {
    fullName: string;
    mail: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }


  login(dto: { mail: string; password: string }) {
    return this.http.post<ExternalLoginResponse>(
      `${this.apiUrl}/login`,
      dto
    );
  }
}
