import { Injectable } from '@angular/core';
import { ExternalUser, UserRole } from '../models/external-login-response';
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
      const userObj = JSON.parse(user) as ExternalUser;

      // 更新使用者狀態
      this.updateState(userObj, false);
    } else {
      this.clear();
    }
  }

  private updateState(user: ExternalUser, saveToStorage: boolean = true) {
    // 1. 決定是否寫入 LocalStorage (防呆機制，再也不會忘記存檔)
    if (saveToStorage) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    const avatar = user.imageUrl
      ? (user.imageUrl.startsWith('http')
        ? user.imageUrl
        : `${this.api}${user.imageUrl}`)
      : '/images/no-image.png';

    // 3. 發送通知
    this.avatarUrlSubject.next(avatar);
    this.userSubject.next(user);
  }
  updateBasicProfile(newData: { fullName: string }) {
    const currentUser = this.userSubject.value;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, fullName: newData.fullName };
    this.updateState(updatedUser); // ✅ 自動存檔 + 更新畫面
  }

  //上傳刷新Header上的圖片
  setAvatarUrl(url: string) {
    const currentUser = this.userSubject.value;
    if (!currentUser) return;

    // 我們把 User 物件裡的 imageUrl 也更新，這樣資料才不會打架
    // 注意：這裡傳入的 url 可能是完整路徑，後端存的可能是相對路徑
    // 為了簡單起見，這裡假設前端顯示用的就是最新的，暫時存入 user
    const updatedUser = { ...currentUser, imageUrl: url };

    this.updateState(updatedUser);
  }

  setUser(token: string, user: ExternalUser) {
    const userWithRole = {
      ...user, role: this.getrole(user.mail)
    }; //原本只有下面setitem跟updateState(user) , 這一串是為了把role塞進去寫的 還沒理解透
    localStorage.setItem('token', token);// Token 只有這裡會變，單獨處理
    this.updateState(userWithRole); // 自動存 user + 更新畫面

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
    this.updateState({ ...user, isMailVerified: true });
  }


  markEmailUnverified() {
    const user = this.userSubject.value;
    if (!user) return;
    this.updateState({ ...user, isMailVerified: false });
  }

  updateEmail(mail: string) {
    const user = this.userSubject.value;
    if (!user) return;
    this.updateState({ ...user, mail });
  }
  getCurrentUser(): ExternalUser | null {
    return this.userSubject.value;
  }

  //前端模擬user / admin身分 這邊直接綁死信箱

  getrole(mail: string): UserRole {

    console.log(mail)
    if (mail === 'admin@gmail.com' || mail === 'ss860530@gmail.com') {
      return 'Admin';
    } else {
      return 'User'
    }
  }
}
