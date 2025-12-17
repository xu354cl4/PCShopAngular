import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    private router: Router) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isExternalLogin = !!user?.provider;

    this.form = this.fb.group({
      fullName: [{ value: user?.fullName || '', disabled: this.isExternalLogin }, Validators.required],
      mail: [{ value: user?.mail || '', disabled: this.isExternalLogin }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      shippingAddress: [''],
      birthDay: [null]
    });
  }

 submit(): void {
  console.log('payload', this.form.value);

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const dto = this.form.getRawValue();

  if (this.isExternalLogin) {
    // 🔹 第三方登入補資料
    this.authService.completeProfile(dto).subscribe(() => {

      // ⭐⭐ 關鍵：同步更新前端狀態 ⭐⭐
      const user = JSON.parse(localStorage.getItem('user')!);
      user.profileCompleted = true;
      localStorage.setItem('user', JSON.stringify(user));

      // 導回首頁
      this.router.navigate(['/']);
    });

  } else {
    // 🔹 一般註冊
    this.authService.register(dto).subscribe(() => {
      this.router.navigate(['/loginpage']);
    });
  }
}

  // HTML 用的小工具
  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }
}
