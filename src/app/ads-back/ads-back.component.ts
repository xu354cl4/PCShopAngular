import { Component, OnInit } from '@angular/core';
import { AdUpsertDto, PositionDto } from '../models/ad.models';
import { AdsApiService } from '../Services/ads.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ads-back',
  imports: [FormsModule, CommonModule],
  templateUrl: './ads-back.component.html',
  styleUrl: './ads-back.component.css'
})
export class AdsBackComponent implements OnInit {
  positions: PositionDto[] = [];
  model: AdUpsertDto = {
    title: '',
    mediaUrl: '',
    linkUrl: '',
    positionID: undefined,
    status: true
  };

  uploading = false;

  constructor(private adsApi: AdsApiService) { }

  ngOnInit() {
    this.adsApi.getPositions().subscribe(p => this.positions = p);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // ✅ 這裡開始處理上傳
    this.uploading = true;

    this.adsApi.uploadMedia(file).subscribe({
      next: res => {
        this.model.mediaUrl = res.mediaUrl;
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      }
    });
  }

  save() {
    this.adsApi.upsertAd(this.model).subscribe(() => alert('儲存成功'));
  }
}

