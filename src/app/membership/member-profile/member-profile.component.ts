import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberApiService } from '../../Services/member-api.service';
import { AuthStateService } from '../../Services/auth-state.service';
import { MemberProfileEdit } from '../../models/member.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.css'
})
export class MemberProfileComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();

  loading = false;
  error = '';
  success = '';

  previewUrl: string | null = null;
  selectedFile: File | null = null;

  isThirdParty = false;
  isMailVerified = false;
  sendingVerifyEmail = false;

  avatarUrl$!: Observable<string | null>;

  form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    birthDate: new FormControl<string | null>(null),
    phone: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    })
  });

  constructor(
    private api: MemberApiService,
    private authState: AuthStateService
  ) { }

  ngOnInit(): void {
    this.avatarUrl$ = this.authState.avatarUrl$;

    this.load();

    this.authState.user$.subscribe(user => {
      if (!user) return;

      this.isThirdParty = !!user.provider && user.provider.toLowerCase() !== 'local';
      this.isMailVerified = user.isMailVerified;

      // ⭐ Email 只從 AuthState 補一次

    });
  }

  /* ================= Profile ================= */

  load() {
    this.loading = true;

    this.api.getProfile().subscribe({
      next: res => {
        this.form.patchValue({
          fullName: res.fullName,
          phone: res.phone,
          birthDate: res.birthDate
            ? res.birthDate.substring(0, 10)
            : null
        });
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message ?? '載入失敗';
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.form.getRawValue();
    const currentUser = this.authState.getCurrentUser();

    // 1️⃣ 先更新「基本資料」
    const profileDto = {
      fullName: formValue.fullName,
      phone: formValue.phone,
      birthDate: formValue.birthDate
    };

    this.api.updateProfile(profileDto).subscribe({
      next: () => {
        // 2️⃣ 再處理 Email（只有 local + 有變才做）
        if (
          !this.isThirdParty &&
          currentUser &&
          formValue.email.trim() !== currentUser.mail
        ) {
          this.updateEmail(formValue.email);
          return;
        }

        this.finishSuccess('基本資料已更新');
      },
      error: err => this.finishError(err)
    });
  }

  /* ================= Email ================= */

  private updateEmail(newEmail: string) {
    const email = newEmail.trim();
    if (!email) {
      this.finishError({ error: { message: 'Email 不可為空' } });
      return;
    }

    this.api.updateEmail({
      newEmail: email,
      frontendUrl: 'http://localhost:4200/verify-email'
    }).subscribe({
      next: () => {
        this.authState.updateEmail(email);
        this.authState.markEmailUnverified();
        this.finishSuccess('Email 已更新，請重新驗證');
      },
      error: err => this.finishError(err)
    });
  }

  sendVerifyEmail() {
    if (this.isMailVerified) return;

    this.sendingVerifyEmail = true;

    this.api.sendVerifyEmail({
      frontendUrl: 'http://localhost:4200/verify-email'
    }).subscribe({
      next: () => {
        this.sendingVerifyEmail = false;
        this.success = '驗證信已寄出';
      },
      error: err => {
        this.sendingVerifyEmail = false;
        this.error = err.error?.message ?? '寄送失敗';
      }
    });
  }

  /* ================= Avatar ================= */

  onFileSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  uploadAvatar() {
    if (!this.selectedFile) return;

    this.loading = true;

    this.api.uploadAvatar(this.selectedFile).subscribe({
      next: res => {
        const url = `https://localhost:7001${res.imageUrl}?t=${Date.now()}`;
        this.authState.setAvatarUrl(url);

        this.previewUrl = null;
        this.selectedFile = null;
        this.finishSuccess('頭像已更新');
      },
      error: err => this.finishError(err)
    });
  }

  /* ================= Helpers ================= */

  private finishSuccess(msg: string) {
    this.loading = false;
    this.success = msg;
    this.saved.emit();
  }

  private finishError(err: any) {
    this.loading = false;
    this.error = err.error?.message ?? '操作失敗';
  }
}
