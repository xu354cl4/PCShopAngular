// src/app/components/ad-slot/ad-slot.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AdsApiService } from '../Services/ads-api.service';
import { AdDto } from '../models/ads.models';

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-slot.component.html',
  styleUrls: ['./ad-slot.component.css']
})
export class AdSlotComponent implements OnInit {
  @Input({ required: true }) positionCode!: string;
  @Input() variant: 'banner' | 'float' = 'banner';
  @Input() pickMode: 'first' | 'random' = 'first';
  @Input() closable = false;
  @Output() closed = new EventEmitter<void>();

  ads: AdDto[] = [];
  active?: AdDto;

  private currentPage = '';
  private pageRules: Record<string, string[]> = {};
  private rulesLoaded = false;

  constructor(
    private api: AdsApiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // ① 先抓「後台設定的頁面規則」
    this.api.getPageRules().subscribe({
      next: (rules) => {
        this.pageRules = rules ?? {};
        this.rulesLoaded = true;

        // 初始頁面
        this.currentPage = this.mapUrlToPage(this.router.url);
        this.loadAds();

        // ② 換頁時自動更新
        this.router.events
          .pipe(filter(e => e instanceof NavigationEnd))
          .subscribe((e: NavigationEnd) => {
            this.currentPage = this.mapUrlToPage(e.urlAfterRedirects);
            this.loadAds();
          });
      },
      error: () => {
        // 保險：規則抓不到就不顯示任何廣告
        this.pageRules = {};
        this.rulesLoaded = true;
        this.ads = [];
        this.active = undefined;
      }
    });
  }

  private loadAds(): void {
    // 🔐 還沒拿到規則，不做任何事
    if (!this.rulesLoaded) return;

    // 🔐 此 position 在此頁面不該顯示
    if (!this.canShowOnCurrentPage()) {
      this.ads = [];
      this.active = undefined;
      return;
    }

    this.api.getSlot(this.positionCode).subscribe({
      next: (list) => {
        this.ads = list ?? [];
        this.active = this.pick(this.ads);
      },
      error: () => {
        this.ads = [];
        this.active = undefined;
      }
    });
  }

  private canShowOnCurrentPage(): boolean {
    const pages = this.pageRules[this.positionCode];
    return !!pages && pages.includes(this.currentPage);
  }

  private pick(list: AdDto[]): AdDto | undefined {
    if (!list.length) return undefined;

    if (this.pickMode === 'random') {
      return list[Math.floor(Math.random() * list.length)];
    }

    // first = 後端排序後的第一筆
    return list[0];
  }

  onClick(ad: AdDto) {
    this.api.trackClick({ adId: ad.adId, positionCode: this.positionCode }).subscribe({
      next: () => this.navigate(ad),
      error: () => this.navigate(ad)
    });
  }

  private navigate(ad: AdDto) {
    if (!ad.linkUrl) return;

    if (ad.linkUrl.startsWith('http')) {
      window.open(ad.linkUrl, '_blank');
    } else {
      window.location.href = ad.linkUrl;
    }
  }

  close(e: MouseEvent) {
    e.stopPropagation();
    this.closed.emit();
  }

  trackOnly(ad: AdDto, e: MouseEvent) {
    if (!ad?.linkUrl) {
      e.preventDefault();
      return;
    }

    this.api.trackClick({ adId: ad.adId, positionCode: this.positionCode }).subscribe();
  }

  // URL → 頁面代碼（集中管理，只改這裡）
  private mapUrlToPage(url: string): string {
    if (url === '/' || url.startsWith('/home')) return 'home';
    if (url.startsWith('/product')) return 'product';
    if (url.startsWith('/faq')) return 'faq';
    if (url.startsWith('/cart')) return 'cart';
    return 'unknown';
  }
}
