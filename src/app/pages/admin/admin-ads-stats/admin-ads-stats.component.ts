// src/app/pages/admin/admin-ads-stats/admin-ads-stats.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdsApiService } from '../../../Services/ads-api.service';
import { ReportRowDto } from '../../../models/ads.models';

@Component({
  selector: 'app-admin-ads-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ads-stats.component.html',
  styleUrls: ['./admin-ads-stats.component.css']
})
export class AdminAdsStatsComponent {
  from = this.minusDays(7);
  to = this.today();
  rows: ReportRowDto[] = [];
  msg = '';

  constructor(private api: AdsApiService) { }

  load() {
    this.msg = '';
    this.api.adminReport(this.from, this.to).subscribe({
      next: r => this.rows = r ?? [],
      error: () => this.msg = '載入失敗'
    });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private minusDays(d: number): string {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().slice(0, 10);
  }
}
