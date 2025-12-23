import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule , FormGroup , FormControl , Validators  } from '@angular/forms';
import { MemberApiService } from '../../Services/member-api.service';
@Component({
  selector: 'app-member-security',
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './member-security.component.html',
  styleUrl: './member-security.component.css'
})
export class MemberSecurityComponent implements OnInit {
  loading=false; error=''; success='';
  provider='local';
  canChangePassword=true;

  form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable:true, validators:[Validators.required]}),
    newPassword: new FormControl('', { nonNullable:true, validators:[Validators.required, Validators.minLength(8)]}),
  });

  constructor(private api: MemberApiService) {}

  ngOnInit(): void {
    this.api.getSecurity().subscribe({
      next: res => {
        this.provider = res.provider;
        this.canChangePassword = res.canChangePassword;
      },
      error: () => {
        this.error = '載入帳號安全資訊失敗';
      }
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.canChangePassword) return;

    this.loading=true; this.error=''; this.success='';
    this.api.changePassword(this.form.getRawValue() as any).subscribe({
      next: () => { this.loading=false; this.success='密碼已更新'; this.form.reset(); },
      error: (err) => { this.loading=false; this.error=err?.error?.message ?? '更新失敗'; }
    });
  }
}
