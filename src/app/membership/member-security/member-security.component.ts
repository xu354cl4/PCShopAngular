import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule , FormGroup , FormControl , Validators  } from '@angular/forms';
import { MemberApiService } from '../../Services/member-api.service';
@Component({
  selector: 'app-member-security',
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './member-security.component.html',
  styleUrl: './member-security.component.css'
})
export class MemberSecurityComponent {
  loading = false;
  error = '';
  success = '';

  // 你原本就有的：第三方登入不允許改密碼
  canChangePassword = true; // 你可用 profile/provider 初始化後決定

  form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(private api: MemberApiService) {}

  private markTouched() {
    this.form.markAllAsTouched();
  }

  private clearServerErrors() {
    // 清掉我們自己塞的後端錯誤
    const cur = this.form.get('currentPassword');
    if (cur?.hasError('incorrect')) {
      const errs = { ...cur.errors };
      delete errs['incorrect'];
      cur.setErrors(Object.keys(errs).length ? errs : null);
    }
  }

  private validateConfirmPassword(): boolean {
    const newPwd = this.form.get('newPassword')?.value ?? '';
    const confirm = this.form.get('confirmPassword')?.value ?? '';

    if (!newPwd || !confirm) return true;

    if (newPwd !== confirm) {
      this.form.get('confirmPassword')?.setErrors({ mismatch: true });
      return false;
    }
    return true;
  }

  save() {
    if (!this.canChangePassword) return;

    this.clearServerErrors();
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      this.markTouched();
      return;
    }

    if (!this.validateConfirmPassword()) {
      this.markTouched();
      return;
    }

    this.loading = true;

    const dto = {
      currentPassword: this.form.get('currentPassword')!.value,
      newPassword: this.form.get('newPassword')!.value,
    };

    this.api.changePassword(dto).subscribe({
      next: () => {
        this.loading = false;
        this.success = '密碼已更新';
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;

        const msg: string = err?.error?.message ?? '更新失敗';

        // ✅ 目前密碼錯誤：掛到欄位上（紅框 + 訊息）
        if (msg.includes('目前密碼錯誤')) {
          this.form.get('currentPassword')?.setErrors({ incorrect: true });
          return;
        }

        // ✅ 第三方不支援：直接顯示
        if (msg.includes('第三方登入')) {
          this.error = msg;
          return;
        }

        // 其他錯誤
        this.error = msg;
      },
    });
  }
}
