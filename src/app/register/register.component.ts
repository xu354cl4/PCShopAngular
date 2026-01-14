import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControl,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { AuthStateService } from '../Services/auth-state.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authState: AuthStateService
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 是否為第三方登入
    this.isExternalLogin = !!user?.provider;

    // ✅ 正確的 Reactive Form 寫法（同步 validator 一定包陣列）
    this.form = this.fb.group({
      fullName: [
        { value: user?.fullName || '', disabled: this.isExternalLogin },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],

      mail: [
        { value: user?.mail || '', disabled: this.isExternalLogin },
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        this.isExternalLogin
          ? []
          : [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20)
          ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^09\d{8}$/)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      shippingAddress: [''],

      birthDay: [
        null,
        [
          Validators.required,
          this.dateValidator
        ]
      ]
    });
  }

  // =========================
  // Validator
  // =========================
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
    return new Date().toISOString().split('T')[0];
  }

  // =========================
  // Demo 一鍵填值（給你測）
  // =========================
  fillDemoData(): void {
    this.form.patchValue({
      fullName: '王大槌',
      mail: 'AAbb890115@gmail.com',
      password: this.isExternalLogin ? '' : '12345678',
      phone: '0912345678',
      address: '台北市信義區市府路 45 號',
      shippingAddress: '台北市信義區市府路 45 號',
      birthDay: '1995-06-15'
    });

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
  }

  // =========================
  // Submit
  // =========================
  Submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.getRawValue();

    if (this.isExternalLogin) {
      // 第三方補資料
      this.authService.completeProfile(formData).subscribe({
        next: () => {
          alert('資料補全成功，請重新登入');
          this.authState.clear();
          this.router.navigate(['/login']);
        },
        error: err => console.error('補全失敗', err)
      });
    } else {
      // 一般註冊
      this.authService.register(formData).subscribe({
        next: () => {
          alert('註冊成功，請登入');
          this.router.navigate(['/loginpage']);
        },
        error: err => console.error('註冊失敗', err)
      });
    }
  }
}
