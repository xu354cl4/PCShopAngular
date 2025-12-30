// src/app/pages/admin/admin-ads/admin-ads.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { AdsApiService } from '../../../Services/ads-api.service';
import { AdDto, AdUpsertDto, PositionDto } from '../../../models/ads.models';

@Component({
  selector: 'app-admin-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-ads.component.html',
  styleUrls: ['./admin-ads.component.css']
})
export class AdminAdsComponent implements OnInit {
  positions: PositionDto[] = [];
  ads: AdDto[] = [];
  selected?: AdDto;

  msg = '';
  loading = false;

  isDragging = false;
  uploading = false;

  form!: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private api: AdsApiService) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      mediaUrl: ['', [Validators.required]],
      linkUrl: [''],
      positionId: [0, [Validators.required, Validators.min(1)]],
      type: ['image', [Validators.required]],
      status: [true],
      startTime: [''], // datetime-local: YYYY-MM-DDTHH:mm
      endTime: ['']
    },
      {
        validators: [this.endNotBeforeStartValidator()] // ✅ 防呆：End >= Start
      });
  }


  ngOnInit(): void {
    this.reload();
  }

  private endNotBeforeStartValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('startTime')?.value as string | null;
      const end = group.get('endTime')?.value as string | null;

      if (!start || !end) return null; // 其中一個空就不擋

      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;

      return e < s ? { endBeforeStart: true } : null;
    };
  }


  reload() {
    this.loading = true;
    this.msg = '';

    this.api.getPositions().subscribe({
      next: p => {
        this.positions = p ?? [];
        if (!this.form.value.positionId && this.positions.length) {
          this.form.patchValue({ positionId: this.positions[0].positionId });
        }
      },
      error: () => { /* positions 可晚點再處理 */ }
    });

    this.api.adminListAds().subscribe({
      next: ads => { this.ads = ads ?? []; this.loading = false; },
      error: () => { this.msg = '載入失敗'; this.loading = false; }
    });
  }

  newAd() {
    this.selected = undefined;
    const firstPos = this.positions[0]?.positionId ?? 0;
    this.form.reset({
      title: '',
      mediaUrl: '',
      linkUrl: '',
      positionId: firstPos,
      type: 'image',
      status: true,
      startTime: '',
      endTime: ''
    });
  }

  pick(ad: AdDto) {
    this.selected = ad;
    this.form.patchValue({
      title: ad.title,
      mediaUrl: ad.mediaUrl,
      linkUrl: ad.linkUrl ?? '',
      positionId: ad.positionId || 0,
      type: ad.type || 'image',
      status: ad.status,
      startTime: ad.startTime ?? '',
      endTime: ad.endTime ?? ''
    });
  }

  save() {
    this.msg = '';

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.msg = '請填完必填欄位（標題/顯示影像/擺放位置/類別）';
      return;
    }

    const v = this.form.getRawValue();
    const dto: AdUpsertDto = {
      title: v.title!,
      mediaUrl: v.mediaUrl!,
      linkUrl: v.linkUrl ? v.linkUrl : null,
      positionId: Number(v.positionId ?? 0),
      type: v.type!,
      status: !!v.status,
      startTime: v.startTime ? v.startTime : null,
      endTime: v.endTime ? v.endTime : null
    };

    if (!this.selected) {
      this.api.adminCreateAd(dto).subscribe({
        next: () => { this.msg = '新增成功'; this.reload(); },
        error: () => { this.msg = '新增失敗'; }
      });
    } else {
      this.api.adminUpdateAd(this.selected.adId, dto).subscribe({
        next: () => { this.msg = '更新成功'; this.reload(); },
        error: () => { this.msg = '更新失敗'; }
      });
    }
  }

  delete(ad: AdDto) {
    if (!confirm(`確定刪除 AdId=${ad.adId} ?`)) return;
    this.api.adminDeleteAd(ad.adId).subscribe({
      next: () => { this.msg = '刪除成功'; this.reload(); },
      error: () => { this.msg = '刪除失敗'; }
    });
  }

  posText(ad: AdDto) {
    const p = this.positions.find(x => x.positionId === ad.positionId);
    return p ? `${p.code} - ${p.name}` : ad.positionCode;
  }

  // 拖拉上傳（圖片/影片）

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    this.uploadFile(file);
  }

  onPickFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    input.value = ''; // 允許同檔重選
    this.uploadFile(file);
  }

  private detectMediaType(file: File): 'image' | 'video' {
    if (file.type?.startsWith('video/')) return 'video';
    if (file.type?.startsWith('image/')) return 'image';

    // fallback：用副檔名判斷（以防某些瀏覽器拿不到 mime）
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.ogg')) return 'video';
    return 'image';
  }

  private uploadFile(file: File) {
    // 你後端已經限制格式，前端這邊也做基本防呆
    const t = this.detectMediaType(file);
    if (t !== 'image' && t !== 'video') {
      this.msg = '只允許圖片或影片檔';
      return;
    }

    this.uploading = true;
    this.msg = '';

    // ⚠️ 這裡假設你 AdsApiService 叫 uploadAdMedia(file)
    this.api.uploadAdMedia(file).subscribe({
      next: (res: any) => {
        const mediaUrl = res.url || res.imageUrl; // 兼容你後端回傳欄位
        if (!mediaUrl) {
          this.msg = '上傳成功但沒有回傳 url';
          this.uploading = false;
          return;
        }

        // ✅ 上傳後立刻覆蓋 MediaUrl + 自動帶入 type
        const autoType: 'image' | 'video' = res.type ?? this.detectMediaType(file);

        this.form.patchValue({
          mediaUrl,
          type: autoType
        });

        this.msg = '上傳成功';
        this.uploading = false;
      },
      error: () => {
        this.msg = '上傳失敗';
        this.uploading = false;
      }
    });
  }

}
