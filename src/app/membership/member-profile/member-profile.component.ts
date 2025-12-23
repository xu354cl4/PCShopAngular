import { MemberProfileEdit } from './../../models/member.models';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberApiService } from '../../Services/member-api.service';
import { AuthStateService } from '../../Services/auth-state.service';


@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.css'
})
export class MemberProfileComponent implements OnInit {
  @Output() saved = new EventEmitter<void>(); // ✅ 儲存後通知父層刷新 overview（可選）

  loading = false;
  error = '';
  success = '';
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    birthDate: new FormControl<string | null>(null),
    phone: new FormControl('', { nonNullable: true })
  });

  constructor(private api: MemberApiService , private authstate : AuthStateService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.api.getProfile().subscribe({
      next: (res: MemberProfileEdit) => {
        this.form.patchValue({ ...res, birthDate: res.birthDate ? res.birthDate.substring(0, 10) : null })

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? '載入基本資料失敗';
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: MemberProfileEdit = this.form.getRawValue() as MemberProfileEdit;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.api.updateProfile(dto).subscribe({
      next: () => {
        this.loading = false;
        this.success = '儲存成功';
        this.saved.emit(); // ✅ 通知父層（讓 overview 也更新）
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? '儲存失敗';
      }
    });
  }


  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  @Output() avatarChanged = new EventEmitter<string>();

  uploadAvatar() {
    if (!this.selectedFile) return;

    this.loading = true;
    this.api.uploadAvatar(this.selectedFile!).subscribe({
    next: (res) => {
      const url = `https://localhost:7001${res.imageUrl}?t=${Date.now()}`; // 防快取
      this.authstate.setAvatarUrl(url);              // ✅ 立刻通知 Header 換圖
      this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? '上傳失敗';
      }
    });
  }
}

