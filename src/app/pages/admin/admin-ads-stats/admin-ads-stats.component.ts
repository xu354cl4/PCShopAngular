import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnDestroy, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import Chart from 'chart.js/auto';
import { AdsApiService } from '../../../Services/ads-api.service';
import { AdsClickStatDto } from '../../../models/ads.models';
import { RouterLink } from '@angular/router';

type Option = { value: string; label: string };

@Component({
  selector: 'app-admin-ads-stats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-ads-stats.component.html',
  styleUrls: ['./admin-ads-stats.component.css']
})
export class AdminAdsStatsComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private fb = inject(FormBuilder);

  msg = '';
  loading = false;

  raw: AdsClickStatDto[] = [];

  positionOptions: Option[] = [{ value: 'ALL', label: '全部位置' }];
  adOptions: Option[] = [{ value: 'ALL', label: '全部廣告' }];

  form = this.fb.group({
    from: [this.toDateInput(new Date(Date.now() - 6 * 86400000))], // 預設近 7 天
    to: [this.toDateInput(new Date())],
    position: ['ALL'],
    ad: ['ALL'],
    mode: ['line'] // line | bar
  });

  constructor(private api: AdsApiService) { }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  load() {
    this.msg = '';
    const v = this.form.getRawValue();
    if (!v.from || !v.to) {
      this.msg = '請選擇日期範圍';
      return;
    }

    this.loading = true;
    this.api.getClickStats(v.from, v.to).subscribe({
      next: (rows) => {
        this.raw = (rows ?? []).map(r => ({
          ...r,
          date: this.normalizeDate(r.date)
        }));
        this.buildFilters();
        this.render();
        this.loading = false;
      },
      error: () => {
        this.msg = '載入統計失敗';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.render();
  }

  private buildFilters() {
    // positions
    const pos = Array.from(new Set(this.raw.map(x => x.positionCode))).sort();
    this.positionOptions = [{ value: 'ALL', label: '全部位置' }, ...pos.map(p => ({ value: p, label: p }))];

    // ads（以 adId + title 組合）
    const map = new Map<number, string>();
    for (const r of this.raw) map.set(r.adId, r.title || `Ad ${r.adId}`);
    const ads = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);

    this.adOptions = [{ value: 'ALL', label: '全部廣告' }, ...ads.map(([id, title]) => ({ value: String(id), label: `#${id} ${title}` }))];

    // 如果目前選的值不存在，就 reset
    const v = this.form.getRawValue();
    if (v.position !== 'ALL' && !pos.includes(v.position!)) this.form.patchValue({ position: 'ALL' }, { emitEvent: false });
    if (v.ad !== 'ALL' && !map.has(Number(v.ad))) this.form.patchValue({ ad: 'ALL' }, { emitEvent: false });
  }

  private render() {
    const v = this.form.getRawValue();
    const filtered = this.raw.filter(r => {
      const okPos = (v.position === 'ALL') || r.positionCode === v.position;
      const okAd = (v.ad === 'ALL') || r.adId === Number(v.ad);
      return okPos && okAd;
    });

    if (filtered.length === 0) {
      this.msg = '此範圍沒有點擊資料';
      this.chart?.destroy();
      return;
    }

    // x 軸：日期（排序）
    const dates = this.buildDateRange(v.from!, v.to!);

    // 依「位置」分 series（如果 ad 選 ALL），否則依單支廣告顯示一條
    const datasets = this.buildDatasets(filtered, dates, v.ad === 'ALL');

    // chart render
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: (v.mode === 'bar' ? 'bar' : 'line'),
      data: {
        labels: dates,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  private buildDatasets(rows: AdsClickStatDto[], dates: string[], groupByPosition: boolean) {
    // key: `${date}|${positionCode}` or `${date}`
    if (!groupByPosition) {
      const title = rows[0]?.title ? rows[0].title : 'Clicks';

      const m = new Map<string, number>();
      for (const r of rows) {
        m.set(r.date, (m.get(r.date) ?? 0) + r.clicks);
      }

      return [{
        label: title,
        data: dates.map(d => m.get(d) ?? 0)
      }];
    }

    const positions = Array.from(new Set(rows.map(x => x.positionCode))).sort();

    // 建索引：date|pos -> clicks
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = `${r.date}|${r.positionCode}`;
      m.set(k, (m.get(k) ?? 0) + r.clicks);
    }

    return positions.map(p => ({
      label: p,
      data: dates.map(d => m.get(`${d}|${p}`) ?? 0)
    }));
  }


  private toDateInput(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private buildDateRange(from: string, to: string): string[] {
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

    // 防呆
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

    const out: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      out.push(this.toDateInput(d)); // 你原本就有
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  private normalizeDate(input: string): string {
    if (!input) return '';

    // 常見：2025-12-25T00:00:00 / 2025-12-25
    if (input.includes('T')) return input.slice(0, 10);

    // 常見：2025-12-25 00:00:00
    if (input.includes(' ')) return input.split(' ')[0];

    // 其他格式：嘗試用 Date parse
    const d = new Date(input);
    if (!isNaN(d.getTime())) return this.toDateInput(d);

    // 最後 fallback
    return input.slice(0, 10);
  }
}
