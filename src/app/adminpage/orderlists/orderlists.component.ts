import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminApiService } from '../../Services/admin-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-orderlists',
  imports: [CommonModule, FormsModule],
  templateUrl: './orderlists.component.html',
  styleUrl: './orderlists.component.css'
})
export class OrderlistsComponent implements OnInit {
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
  constructor(private adminService: AdminApiService) { }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadOrders(1);
      });
    this.loadOrders(1);
  }

  // ⭐ 核心：統一用這支
  loadOrders(page: number) {
    this.loading = true;
    this.noData = false;

    this.adminService
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
    this.loadOrders(1);
  }

  // ▶ 換頁
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadOrders(page);
  }

  goDetail(orderid: number) {
    this.openDetail.emit(orderid);
  }
}
