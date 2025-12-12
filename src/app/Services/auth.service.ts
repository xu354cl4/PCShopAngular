import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExternalLoginResponse {
  token: string;
  user: boolean
  profileCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7001/api/auth'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }

  loginWithGoogle(idToken: string): Observable<ExternalLoginResponse> {
    return this.http.post<ExternalLoginResponse>(`${this.apiUrl}/google-login`, {
      provider: 'google',
      idToken: idToken,
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
}

