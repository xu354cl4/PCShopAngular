import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdsBackComponent } from "../ads-back/ads-back.component";
import { FaqsBackComponent } from "../faqs-back/faqs-back.component";
import { OrderlistsComponent } from "./orderlists/orderlists.component";
import { OrderdetailsComponent } from "./orderdetails/orderdetails.component";

@Component({
  selector: 'app-adminpage',
  imports: [CommonModule, AdsBackComponent, FaqsBackComponent, OrderlistsComponent, OrderdetailsComponent],
  templateUrl: './adminpage.component.html',
  styleUrl: './adminpage.component.css'
})
export class AdminpageComponent implements OnInit, AfterViewInit, OnDestroy {
  // 視圖控制變數
  mainView: string = 'overview';
  orderView: string = 'pending';
  settingsView: string = 'profile';
  benefitsView: string = 'coupon';
  selectedOrderId: number | null = null;

  loading: boolean = false;
  error: string | null = null;

  // 假資料物件
  overview: any = null;
  chart: any = null; // 存放圖表實例

  // 取得 HTML 中的 canvas 元素
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.loadFakeData();
  }

  ngAfterViewInit() {
    // 確保畫面渲染後才繪製圖表 (僅在 overview 模式下)
    if (this.mainView === 'overview') {
      this.renderChart();
    }
  }

  // 模擬 API 載入資料
  loadFakeData() {
    this.loading = true;
    setTimeout(() => {
      this.overview = {
        profile: {
          fullName: '王小明',
          birthDate: new Date('1995-05-20'),
          phone: '0912-345-678',
          email: 'wang.demo@example.com',
          level: '黃金會員',
          points: 1250
        },
        // 假訂單資料
        latestOrders: [
          { orderNo: '2023102401', statusCode: 'pending', statusText: '待付款', totalAmount: 1200 },
          { orderNo: '2023102055', statusCode: 'shipping', statusText: '配送中', totalAmount: 560 },
          { orderNo: '2023101533', statusCode: 'completed', statusText: '已完成', totalAmount: 3400 },
        ],
        // 用於圓餅圖的消費數據
        spendingAnalysis: {
          labels: ['3C周邊', '居家生活', '美妝保養', '食品飲料'],
          data: [5000, 1200, 800, 2500]
        }
      };
      this.loading = false;

      // 資料載入後嘗試繪圖 (處理非同步問題)
      setTimeout(() => this.renderChart(), 0);
    }, 500);
  }

  renderChart() {
    // 如果不在總覽頁面或沒有資料，就不畫
    if (this.mainView !== 'overview' || !this.overview || !this.pieChartCanvas) return;

    // 如果圖表已存在，先銷毀舊的避免重疊
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'doughnut', // 甜甜圈圖 (圓餅圖的一種，比較好看)
        data: {
          labels: this.overview.spendingAnalysis.labels,
          datasets: [{
            label: '消費金額',
            data: this.overview.spendingAnalysis.data,
            backgroundColor: [
              '#FF6384', // 紅
              '#36A2EB', // 藍
              '#FFCE56', // 黃
              '#4BC0C0'  // 綠
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: '年度消費類別分析'
            }
          }
        }
      });
    }
  }

  // 切換視圖時如果回到 overview 要重畫圖表
  switchView(view: string) {
    this.mainView = view;
    this.selectedOrderId = null;
    if (view === 'overview') {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  // 以下為子組件互動邏輯 (保持原樣或根據需求修改)
  orderListState = {
    page: 1,
    pageSize: 4,
    filterStatus: undefined as string | undefined,
    keyword: undefined as string | undefined
  };

  closeOrderDetail() {
    this.selectedOrderId = null;
  }

  openOrderDetail(orderId: number) {
    this.selectedOrderId = orderId;
  }
  onProfileSaved() { alert('資料已儲存！'); }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
