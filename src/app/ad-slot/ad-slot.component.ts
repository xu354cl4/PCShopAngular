// src/app/components/ad-slot/ad-slot.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private api: AdsApiService) { }

  ngOnInit(): void {
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

  private pick(list: AdDto[]): AdDto | undefined {
    if (!list.length) return undefined;
    if (this.pickMode === 'random') {
      return list[Math.floor(Math.random() * list.length)];
    }
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
}
