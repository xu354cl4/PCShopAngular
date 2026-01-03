// src/app/models/ads.models.ts

export interface PositionDto {
  positionId: number;
  code: string;
  size: string;
  name: string;
  isActive: boolean;
}

export interface AdDto {
  adId: number;
  title: string;
  mediaUrl: string;
  linkUrl?: string | null;

  positionId: number;
  positionCode: string;

  type: 'image' | 'video' | string;
  status: boolean;

  startTime?: string | null;
  endTime?: string | null;
}

export interface AdUpsertDto {
  title: string;
  mediaUrl: string;
  linkUrl?: string | null;

  positionId: number; // 0 -> 後端存 null
  type: 'image' | 'video' | string;
  status: boolean;

  startTime?: string | null;
  endTime?: string | null;
}

export interface TrackClickDto {
  adId: number;
  positionCode: string;
}

export interface ReportRowDto {
  date: string;          // 後端回 DateTime -> 前端用 string 接即可
  positionCode: string;
  adId: number;
  title: string;
  clicks: number;
}

export interface AdsClickStatDto {
  date: string;         // e.g. "2025-12-31"
  adId: number;
  title: string;
  positionCode: string; // e.g. "right_float"
  clicks: number;
}
