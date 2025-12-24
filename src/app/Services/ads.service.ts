import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdDto, AdUpsertDto, PositionDto } from '../models/ad.models';


@Injectable({ providedIn: 'root' })
export class AdsApiService {
  constructor(private http: HttpClient) { }
  private api = '/api/ads';
  private apiUrl = '/api/upload';

  getAds(positionCode: string) {
    return this.http.get<AdDto[]>(`${this.api}?positionCode=${positionCode}`);
  }

  getPositions() {
    return this.http.get<PositionDto[]>(`${this.api}/positions`);
  }

  upsertAd(dto: AdUpsertDto) {
    return this.http.post(`${this.api}`, dto);
  }

  trackClick(adId: number) {
    return this.http.post(`${this.api}/${adId}/click`, {});
  }

  uploadMedia(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ mediaUrl: string }>(`${this.apiUrl}/ad-media`, form);
  }
}
