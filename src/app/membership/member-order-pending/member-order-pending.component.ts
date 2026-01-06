import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-member-order-pending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-order-pending.component.html',
  styleUrl: './member-order-pending.component.css'
})
export class MemberOrderPendingComponent implements OnInit {
  @Input() state!: {
    page: number;
    pageSize: number;
    filterStatus?: any;
    keyword?: string;
  };

  @Output() stateChange = new EventEmitter<any>();
  @Output() openDetail = new EventEmitter<number>();

  // 🔹 現在 orders 就是「當頁資料」
  orders: any[] = [];
  search$ = new Subject<string>();
  filterStatus: '' | 'pending' | 'shipping' | 'completed' = '';
  keyword = '';

  pageSize = 4;
  currentPage = 1;

  // 🔹 從後端來
  totalPages = 1;
  total = 0;

  loading = false;
  noData = false;

  constructor(private orderService: OrderApiService) { }
  ngOnInit(): void {
    this.pageSize = this.state.pageSize;
    this.currentPage = this.state.page;
    this.filterStatus = 'pending';
    this.keyword = this.state.keyword ?? '';

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.saveState();
        this.loadOrders(this.currentPage);
      });
    this.loadOrders(this.currentPage);
  }

  // ⭐ 核心：統一用這支
  loadOrders(page: number) {
    this.loading = true;
    this.noData = false;

    this.orderService
      .getOrders(
        page,
        this.pageSize,
        this.filterStatus || undefined,
        this.keyword || undefined
      )
      .subscribe(res => {
        this.orders = res.items;
        this.currentPage = res.page;
        this.pageSize = res.pageSize;
        this.totalPages = res.totalPages;
        this.total = res.total;

        this.noData = res.total === 0;
        this.loading = false;
      });
  }


  // 🔍 篩選 / 搜尋 → 回第一頁
  applyFilter() {
    this.currentPage = 1;
    this.saveState()
    this.loadOrders(1);
  }

  // ▶ 換頁
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.saveState()
    this.loadOrders(page);
  }

  goDetail(orderid: number) {
    this.saveState()
    this.openDetail.emit(orderid);
  }
  private saveState() {
    this.stateChange.emit({
      page: this.currentPage,
      pageSize: this.pageSize,
      keyword: this.keyword || undefined
    });
  }
}

