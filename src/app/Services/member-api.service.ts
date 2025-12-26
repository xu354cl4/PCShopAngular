import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberOverview, MemberProfile , MemberProfileEdit } from '../models/member.models';

@Injectable({
  providedIn: 'root'
})
export class MemberApiService {
  private apiUrl = 'https://localhost:7001/api/member'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }

  getOverview() {
    return this.http.get<MemberOverview>(`${this.apiUrl}/overview`);
  }

  getProfile() {
  return this.http.get<MemberProfileEdit>(`${this.apiUrl}/profile`);
}

  updateProfile(dto: {
    fullName: string;
    phone: string;
    birthDate: string | null;
  }) {
  return this.http.put(`${this.apiUrl}/profile`, dto);
}





  getAddress() {
    return this.http.get<{ address: string; shippingAddress: string }>(`${this.apiUrl}/address`);
}

  updateAddress(dto: { address: string; shippingAddress: string }) {
    return this.http.put<void>(`${this.apiUrl}/address`, dto);
}

  getSecurity() {
    return this.http.get<{ provider: string; canChangePassword: boolean }>(`${this.apiUrl}/security`);
}

  changePassword(dto: { currentPassword: string; newPassword: string }) {
    return this.http.put(`${this.apiUrl}/password`, dto);
}


  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/avatar`, fd);
}

  sendVerifyEmail(dto: { frontendUrl: string }) {
    return this.http.post<void>(
      `${this.apiUrl}/verify-email/send`,
      dto
    );
  }

  confirmVerifyEmail(token: string) {
    return this.http.get(
      `${this.apiUrl}/verify-email/confirm`,
      { params: { token } }
    );
  }

  updateEmail(newEmail: string) {
    // 後端 MemberController 的 [HttpPut("email")] 只需  Body 帶入 newEmail
    // 不需要再傳 frontendUrl，因為後端會自己讀 Config
    return this.http.put(`${this.apiUrl}/email`, { newEmail });
  }

}
