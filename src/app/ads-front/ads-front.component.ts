import { Component, OnInit } from '@angular/core';
import { AdDto } from '../models/ad.models';
import { AdsApiService } from '../Services/ads.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ads-front',
  imports: [],
  templateUrl: './ads-front.component.html',
  styleUrl: './ads-front.component.css'
})
export class AdsFrontComponent implements OnInit {
  carouselAds: AdDto[] = [];
  leftAds: AdDto[] = [];
  rightAds: AdDto[] = [];

  constructor(private adsApi: AdsApiService, private router: Router) { }

  ngOnInit() {
    this.adsApi.getAds('HOME_CAROUSEL').subscribe(x => this.carouselAds = x);
    this.adsApi.getAds('HOME_FLOAT_LEFT').subscribe(x => this.leftAds = x);
    this.adsApi.getAds('HOME_FLOAT_RIGHT').subscribe(x => this.rightAds = x);
  }

  onClick(ad: AdDto) {
    this.adsApi.trackClick(ad.adId).subscribe(); // 不等回來也行

    // TODO: 你指定商品頁規則（先用 LinkUrl）
    if (ad.linkUrl) this.router.navigateByUrl(ad.linkUrl);
  }

  isVideo(url: string) {
    return url?.toLowerCase().endsWith('.mp4');
  }
}

