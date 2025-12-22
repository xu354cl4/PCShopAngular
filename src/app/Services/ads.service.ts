import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdDto, AdUpsertDto, PositionDto } from '../models/ad.models';


@Injectable({ providedIn: 'root' })
export class AdsApiService {
  constructor(private http: HttpClient) { }

  getAds(positionCode: string) {
    return this.http.get<AdDto[]>(`/api/ads?positionCode=${positionCode}`);
  }

  getPositions() {
    return this.http.get<PositionDto[]>(`/api/ads/positions`);
  }

  upsertAd(dto: AdUpsertDto) {
    return this.http.post(`/api/ads`, dto);
  }

  trackClick(adId: number) {
    return this.http.post(`/api/ads/${adId}/click`, {});
  }

  uploadMedia(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ mediaUrl: string }>(`/api/upload/ad-media`, form);
  }
}
