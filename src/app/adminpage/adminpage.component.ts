import { AdminApiService } from './../Services/admin-api.service';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FaqsBackComponent } from "../faqs-back/faqs-back.component";
import { OrderlistsComponent } from "./orderlists/orderlists.component";
import { OrderdetailsComponent } from "./orderdetails/orderdetails.component";
import { AdminLayoutComponent } from "../pages/admin/admin-layout/admin-layout.component";
import { AdminProductListComponent } from './admin-product-list/admin-product-list.component';

// ===== 定義可用的後台畫面 =====
type MainView = 'overview' | 'Ad' | 'Faq' | 'Orders' | 'settings' | 'Products';

@Component({
  selector: 'app-adminpage',
  standalone: true,
  imports: [
    CommonModule,
    FaqsBackComponent,
    OrderlistsComponent,
    OrderdetailsComponent,
    AdminLayoutComponent,
    AdminProductListComponent
  ],
  templateUrl: './adminpage.component.html',
  styleUrl: './adminpage.component.css'
})
export class AdminpageComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(private adminService: AdminApiService) { }
  // ===== 畫面狀態 =====
  mainView: MainView = 'overview';
  selectedOrderId: number | null = null;

  loading = false;
  error: string | null = null;

  // ===== KPI 數據 =====
  dashboard = {
    totalMembers: 0,
    yearlyRevenue: 0,
    monthOrders: 0,
    avgOrderAmount: 0
  };

  // ===== 圖表資料 =====
  overview = {
    spendingAnalysis: {
      labels: [] as string[],
      data: [] as number[]
    }
  };

  private chart: Chart | null = null;

  @ViewChild('pieChartCanvas')
  pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  // ===== 訂單清單狀態 =====
  orderListState = {
    page: 1,
    pageSize: 4,
    filterStatus: undefined as string | undefined,
    keyword: undefined as string | undefined
  };

  // =============================
  // Lifecycle
  // =============================

  ngOnInit(): void {
    // 🚫 後端尚未提供 overview API，先停用
    // this.loadDashboardFromApi();
  }

  ngAfterViewInit(): void {
    if (this.mainView === 'overview') {
      this.tryRenderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  // =============================
  // =============================

  loadDashboardFromApi() {
    this.loading = true;
    this.error = null;

    this.adminService.getOverview().subscribe({
      next: res => {

        // KPI
        this.dashboard = res.dashboard;

        // 圖表資料（圓餅 / 折線）
        if (res.spendingAnalysis) {
          this.overview.spendingAnalysis = res.spendingAnalysis;
        }

        // 如果你之後要畫折線圖
        // this.yearlyRevenue = res.yearlyRevenue;

        this.loading = false;

        // 資料進來後再畫圖
        this.tryRenderChart();
      },
      error: err => {
        console.error(err);
        this.error = '載入後台營運資料失敗';
        this.loading = false;
      }
    });
  }

  // =============================
  // Chart 處理
  // =============================

  private tryRenderChart() {
    setTimeout(() => {
      if (this.mainView !== 'overview') return;
      if (!this.pieChartCanvas) return;
      if (!this.overview.spendingAnalysis.labels.length) return;

      this.renderChart();
    });
  }

  private renderChart() {
    this.destroyChart();

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.overview.spendingAnalysis.labels,
        datasets: [{
          label: '消費金額',
          data: this.overview.spendingAnalysis.data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: '年度消費類別分析'
          }
        }
      }
    });
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // =============================
  // View 切換
  // =============================

  switchView(view: typeof this.mainView) {
    this.mainView = view;
    this.selectedOrderId = null;

    if (view === 'overview') {
      this.tryRenderChart();
    }
  }

  // =============================
  // 訂單 Detail
  // =============================

  openOrderDetail(orderId: number) {
    this.selectedOrderId = orderId;
  }

  closeOrderDetail() {
    this.selectedOrderId = null;
  }
}
