import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MemberApiService } from '../../Services/member-api.service';
import { AuthStateService } from '../../Services/auth-state.service';
import { MemberProfileEdit } from '../../models/member.models';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.css'
})
export class MemberProfileComponent implements OnInit {

  @Output() saved = new EventEmitter<void>();
  isVerifying = false;
  currentDbEmail = '';
  /* ===== 狀態 ===== */
  loading = false;
  error = '';
  success = '';

  /* ===== 使用者狀態 ===== */
  isThirdParty = false;
  isMailVerified = false;
  emailUpdateFailed = false;
  /* ===== Email（獨立綁定，不放進 FormGroup 以避免驗證打架）===== */
  emailInput = '';

  /* ===== Avatar ===== */
  avatarUrl$!: Observable<string | null>;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  /* ===== 基本資料 Form（不含 Email）===== */
  profileForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    phone: new FormControl('', { nonNullable: true }),
    birthDate: new FormControl<string | null>(null)
  });

  constructor(
    private api: MemberApiService,
    public authState: AuthStateService, // public 讓 HTML 可以存取
    private router: Router
  ) { }

  ngOnInit(): void {
    this.avatarUrl$ = this.authState.avatarUrl$;

    // 1️⃣ 載入基本資料
    this.api.getProfile().subscribe({
      next: (res: MemberProfileEdit) => {
        this.profileForm.patchValue({
          fullName: res.fullName,
          phone: res.phone,
          birthDate: res.birthDate ? res.birthDate.substring(0, 10) : null
        });

        // 🔥【修正點 1】解決紅字：強制轉型讀取 mail
        // 🔥【修正點 2】同步狀態：連同 "驗證狀態" 一起更新
        const apiData = res as any; // 暫時轉型，方便讀取隱藏欄位

        if (apiData.mail) {
          this.currentDbEmail = apiData.mail; // 記住 DB 真實 Email
          this.emailInput = apiData.mail;
          // 如果你想自動填入輸入框，就留這行；不想就註解掉
        }

        // ⭐ 關鍵：如果有回傳 isMailVerified，要用 API 的最新狀態覆蓋 AuthState
        // 假設後端欄位叫 isMailVerified (請確認 Network 回傳名稱)
        if (apiData.isMailVerified !== undefined) {
          this.isMailVerified = (apiData.isMailVerified === 1 || apiData.isMailVerified === true);
        }
        if (apiData.avatarUrl) {
          // 組合完整路徑 (請確認你的 Port 是 7001 還是其他)
          // 如果後端存的是完整網址就不用加 https://...
          const backendUrl = 'https://localhost:7001';
          const fullPath = `${backendUrl}${apiData.avatarUrl}`;
          // 更新 AuthState，這樣 HTML 裡的 async pipe 才會收到通知並顯示圖片
          this.authState.setAvatarUrl(fullPath);
        }
      },
      error: () => { this.error = '載入基本資料失敗'; }
    });

    // // 2️⃣ AuthState 的訂閱 (作為備案)
    // this.authState.user$.subscribe(user => {
    //   if (!user) return;

    //   // 只有在 API 還沒回來時，才用 AuthState 的舊資料
    //   if (!this.currentDbEmail) {
    //     this.emailInput = user.mail ?? '';
    //     this.currentDbEmail = user.mail ?? '';
    //     this.isMailVerified = (user.isMailVerified as unknown as number) === 1;
    //   }

    //   this.isThirdParty = !!user.provider && user.provider.toLowerCase() !== 'local';
    // });

    // 2️⃣ AuthState 的訂閱保留，但主要用於判斷是否為第三方登入等狀態
    this.authState.user$.subscribe(user => {
      if (!user) return;
      // 如果 API 還沒回來，先暫時用 AuthState 的，但 API 回來後會覆蓋掉
      if (!this.currentDbEmail) {
        this.emailInput = user.mail ?? '';
        this.currentDbEmail = user.mail ?? '';
      }

      this.isMailVerified = (user.isMailVerified as unknown as number) === 1;
      this.isThirdParty = !!user.provider && user.provider.toLowerCase() !== 'local';
    });
  }
  /* ================= 核心儲存邏輯 ================= */
  save() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // STEP 1: 先更新基本資料
    const profileDto = this.profileForm.getRawValue();

    this.api.updateProfile(profileDto).subscribe({
      next: () => {

        // 🔥🔥🔥【關鍵新增】更新成功後，立刻同步 AuthState 🔥🔥🔥
        this.authState.updateBasicProfile({
          fullName: profileDto.fullName
        });

        // STEP 2: 檢查是否要改 Email (原本的邏輯)
        this.handleEmailChange();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message ?? '基本資料更新失敗';
      }
    });
  }

  /* ================= Email 更新流程 ================= */
  private handleEmailChange() {
    if (this.isThirdParty) {
      this.finish('基本資料已更新');
      return;
    }

    const newEmail = this.emailInput.trim();
    const oldEmail = this.currentDbEmail;

    // 如果沒改 Email，或改為空值，就當作沒事
    if (!newEmail || newEmail === oldEmail) {
      this.finish('基本資料已更新');
      return;
    }

    // 呼叫後端 API
    this.api.updateEmail(newEmail).subscribe({
      next: () => {
        // 🔥🔥🔥【原本的邏輯刪掉，改成強制登出】🔥🔥🔥

        // 1. 給使用者一個明確的提示 (建議用 alert 或 MatDialog，這裡用簡單的 confirm/alert)
        alert(`Email 更新成功！\n驗證信已寄至 ${newEmail}。\n為了您的帳戶安全，請使用新 Email 重新登入。`);

        // 2. 清除前端登入狀態 (Token, LocalStorage)
        this.authState.clear();

        // 3. 強制踢回登入頁 (假設你的登入頁路徑是 /login)
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        // 如果只是 Email 失敗，但基本資料其實已經存了，這裡顯示錯誤給使用者看
        this.error = `基本資料已存，但 Email 更新失敗：${err.error?.message ?? '未知錯誤'}`;
        this.emailInput = oldEmail
        this.emailUpdateFailed = true;
      }
    });
  }

  /* ================= Avatar ================= */
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  uploadAvatar() {
    if (!this.selectedFile) return;
    this.loading = true;
    this.api.uploadAvatar(this.selectedFile).subscribe({
      next: res => {
        const imageUrl = `https://localhost:7001${res.imageUrl}?t=${Date.now()}`;
        this.previewUrl = null;
        this.selectedFile = null;
        this.authState.setAvatarUrl(imageUrl);
        this.finish('頭像已更新');
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message ?? '頭像上傳失敗';
      }
    });
  }

  /* ================= Email 驗證信 (針對未驗證的舊信箱) ================= */
  sendVerifyEmail() {
    if (this.isMailVerified) return;

    // 按鈕防呆
    if (this.emailInput !== this.authState.getCurrentUser()?.mail) {
      this.error = '請先儲存您的 Email 變更';
      return;
    }

    this.api.sendVerifyEmail({
      frontendUrl: 'http://localhost:4200'
    }).subscribe({
      next: () => this.success = '驗證信已寄出，請至信箱完成驗證',
      error: (err) => this.error = err.error?.message ?? '寄送失敗'
    });
  }

  private finish(msg: string) {
    this.loading = false;
    this.success = msg;
    this.saved.emit();
  }
}
