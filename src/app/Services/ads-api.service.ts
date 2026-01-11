// src/app/services/ads-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdDto, AdUpsertDto, PositionDto, ReportRowDto, TrackClickDto, AdsClickStatDto } from '../models/ads.models';

@Injectable({ providedIn: 'root' })
export class AdsApiService {


  constructor(private http: HttpClient) { }

  // ===== public =====
  getPositions(): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(`https://localhost:7001/api/ads/positions`);
  }

  getSlot(positionCode: string): Observable<AdDto[]> {
    return this.http.get<AdDto[]>(`https://localhost:7001/api/ads/slot/${encodeURIComponent(positionCode)}`);
  }

  trackClick(dto: TrackClickDto): Observable<void> {
    return this.http.post<void>(`https://localhost:7001/api/ads/track/click`, dto);
  }

  // ===== admin =====
  adminListAds(): Observable<AdDto[]> {
    return this.http.get<AdDto[]>(`https://localhost:7001/api/admin/ads`);
  }

  adminCreateAd(dto: AdUpsertDto): Observable<{ adId: number }> {
    return this.http.post<{ adId: number }>(`https://localhost:7001/api/admin/ads`, dto);
  }

  adminUpdateAd(adId: number, dto: AdUpsertDto): Observable<void> {
    return this.http.put<void>(`https://localhost:7001/api/admin/ads/${adId}`, dto);
  }

  adminDeleteAd(adId: number): Observable<void> {
    return this.http.delete<void>(`https://localhost:7001/api/admin/ads/${adId}`);
  }

  adminReport(from: string, to: string): Observable<ReportRowDto[]> {
    return this.http.get<ReportRowDto[]>(
      `https://localhost:7001/api/admin/ads/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
  }
  uploadAdMedia(file: File) {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<{ url?: string; imageUrl?: string; type?: 'image' | 'video' }>(
      `https://localhost:7001/api/upload/ad-media`,
      fd
    );
  }
  uploadMedia(file: File) {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<{ url: string; type: 'image' | 'video' }>(
      `https://localhost:7001/api/admin/ads/upload`,
      fd
    );
  }
  getClickStats(from: string, to: string) {
    return this.http.get<AdsClickStatDto[]>(
      `https://localhost:7001/api/admin/ads/report`,
      { params: { from, to } }
    );
  }


  // ===============================
  // ⭐ 新增：後台設定的頁面顯示規則
  // ===============================
  getPageRules() {
    return this.http.get<Record<string, string[]>>(
      `https://localhost:7001/admin/ads/page-rules`
    );
  }

  savePageRules(payload: { rules: Record<string, string[]> }) {
    return this.http.post(
      '/api/admin/ads/page-rules',
      payload
    );
  }
}
