import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-resetpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resetpage.component.html',
  styleUrl: './resetpage.component.css'
})
export class ResetpageComponent implements OnInit {

  mode: 'request' | 'reset' | 'verify' = 'request';
  token: string | null = null;

  requestForm!: FormGroup;
  resetForm!: FormGroup;

  message: string | null = null;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForms();

    const token = this.route.snapshot.queryParamMap.get('token');
    const action = this.route.snapshot.routeConfig?.path;

    if (action === 'reset-password' && token) {
      this.mode = 'reset';
      this.token = token;
    } else if (action === 'verify-email' && token) {
      this.mode = 'verify';
      this.token = token;
      this.verifyEmail();
    }
  }

  initForms() {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  sendResetMail() {
    if (this.requestForm.invalid) return;

    this.resetMsg();
    this.loading = true;

    const email = this.requestForm.get('email')!.value;

    this.authService.forgotPassword(email).subscribe({
      next: res => {
        this.message = res.message ?? '如果帳號存在，已寄出信件';
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err.error?.message ?? '寄送失敗';
        this.loading = false;
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) return;

    this.resetMsg();

    const newPassword = this.resetForm.get('newPassword')!.value;

    this.authService.resetPassword(this.token!, newPassword).subscribe({
      next: res => {
        this.message = res.message ?? '密碼已更新';
        setTimeout(() => {
          this.router.navigate(['/loginpage']);
        }, 2000);
      },
      error: err => {
        this.errorMessage = err.error?.message ?? '重設失敗';
      }
    });
  }

  verifyEmail() {
    this.authService.verifyEmail(this.token!).subscribe({
      next: res => {
        this.message = res.message ?? '驗證成功';
      },
      error: err => {
        this.errorMessage = err.error?.message ?? '驗證失敗';
      }
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const pwd = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pwd === confirm ? null : { passwordMismatch: true };
  }

  resetMsg() {
    this.message = null;
    this.errorMessage = null;
  }
}
