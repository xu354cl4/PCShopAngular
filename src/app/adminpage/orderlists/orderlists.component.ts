import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../Services/admin-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-orderlists',
  imports: [CommonModule, FormsModule],
  templateUrl: './orderlists.component.html',
  styleUrl: './orderlists.component.css'
})
export class OrderlistsComponent implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = []; // 篩選後
  pagedOrders: any[] = [];    // 當前頁要顯示的
  filterStatus: '' | 'Pending' | 'Shipping' | 'Completed' = '';
  keyword = '';
  pageSize = 5;
  currentPage = 1;
  totalPages = 0;

  constructor(private adminService: AdminApiService) {

  }

  ngOnInit(): void {
    this.adminService
      .getOrders()
      .subscribe(res => this.orders = res);
  }

  goDetail(orderid: number) {

  }

  applyFilter() {
    this.adminService
      .getOrders(this.filterStatus, this.keyword)
      .subscribe(res => this.orders = res);
    // // 狀態篩選
    // if (this.filterStatus !== 'All') {
    //   result = result.filter(o => o.status === this.filterStatus);
    // }

    // // 關鍵字（訂單編號）
    // if (this.keyword.trim()) {
    //   result = result.filter(o =>
    //     o.orderNo.includes(this.keyword.trim())
    //   );
    // }

    // this.filteredOrders = result;

    // // ⭐ 套用完 filter 要回到第一頁
    // this.currentPage = 1;
    // this.applyPagination();
  }

  applyPagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedOrders = this.filteredOrders.slice(start, end);
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
  }


  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

}
