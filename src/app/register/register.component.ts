import { AuthStateService } from '../Services/auth-state.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;
  isExternalLogin = false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService) { }

  ngOnInit(): void {
    // 這裡建議改用 Service 拿資料，但如果你暫時用 localStorage 也可以
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 判斷是否有 provider (例如 "Google")
    this.isExternalLogin = !!user?.provider;

    this.form = this.fb.group({
      // 如果是第三方登入，名字跟信箱鎖定 (disabled)
      fullName: [{ value: user?.fullName || '', disabled: this.isExternalLogin }, Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      mail: [{ value: user?.mail || '', disabled: this.isExternalLogin }, [Validators.required, Validators.email]],

      // ⭐ [加入這裡] 密碼欄位
      // 邏輯：如果是外部登入(Google)，密碼不用填(Validators為空)；如果是本地註冊，密碼必填
      password: ['', this.isExternalLogin ? [] : [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],

      phone: ['', Validators.required, Validators.pattern(/^09\d{8}$/)],
      address: ['', Validators.required, Validators.maxLength(200)],
      shippingAddress: [''],
      birthDay: [
        null,
        // ⭐ 注意這裡：一定要用 [] 包起來
        Validators.compose([Validators.required, this.dateValidator])
      ]
    });
  }


  dateValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      return { futureDate: true };
    }

    const minDate = new Date('1900-01-01');
    if (inputDate < minDate) {
      return { tooOld: true };
    }

    return null;
  };

  getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // 回傳 '2025-12-16' 格式
  }

  // ⭐ [加入這個方法] 提交表單
  Submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // 觸發所有紅字錯誤提示
      return;
    }

    const formData = this.form.getRawValue(); // 使用 getRawValue 以確保拿到 disabled 的欄位值


    if (this.isExternalLogin) {
      // --- 情況 A: Google 補全資料 ---
      // 呼叫 CompleteProfile API (不需要密碼)
      this.authService.completeProfile(formData).subscribe({
        next: () => {
          alert('資料補全成功！ 請重新登入'); // 跳轉回首頁
          this.authState.clear();
          // 3. 強制踢回登入頁 (假設你的登入頁路徑是 /login)
          this.router.navigate(['/login']);
        },
        error: (err) => console.error('補全失敗', err)
      });

    } else {
      // --- 情況 B: 本地一般註冊 ---
      // 呼叫 Register API (需要密碼)
      this.authService.register(formData).subscribe({
        next: () => {
          alert('註冊成功，請登入');
          this.router.navigate(['/loginpage']); // 跳轉去登入頁
        },
        error: (err) => console.error('註冊失敗', err)
      });
    }
  }
}
