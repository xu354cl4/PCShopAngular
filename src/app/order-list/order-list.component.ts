import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderApiService } from '../Services/order-api.service';
import { EcpayService } from '../Services/ecpay.service';

// 引入 CommonModule 以使用 CurrencyPipe 等功能

// 1. 定義介面 (Interface)
// 訂單內的單一商品
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// 訂單主體
export interface Order {
  id: number;              // 資料庫真正 ID
  orderId: string;        // 訂單編號 (例如: ORD-2023121001)
  orderDate: Date;        // 下單日期
  status: any; // 訂單狀態 (支援字串或數字 Enum)
  totalAmount: number;    // 訂單總金額
  items: OrderItem[];     // 購買的商品列表
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})

//API串接//
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  selectedOrderDetails: any = null;
  showModal: boolean = false;
  String = String;
  currentFilter: string = 'all';
  searchQuery: string = '';

  // 分頁相關變數 (自定義實作)
  totalRecords: number = 0;
  pageSize: number = 3;
  currentPage: number = 1;
  
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  constructor(
    private orderService: OrderApiService,
    private ecpayService: EcpayService
  ) { }

  ngOnInit(): void {
    this.loadOrders(1);
  }

  loadOrders(page: number): void {
    this.currentPage = page;
    
    // 轉換 status 為 API 預期的格式
    let apiStatus = undefined;
    if (this.currentFilter !== 'all') {
      apiStatus = this.currentFilter;
    }

    this.orderService.getOrders(page, this.pageSize, apiStatus, this.searchQuery).subscribe({
      next: (result: any) => {
        console.log('取得訂單列表結果:', result);

        let rawOrders: any[] = [];
        if (result && result.items) {
          rawOrders = result.items;
          this.totalRecords = result.total || 0;
        } else if (Array.isArray(result)) {
          rawOrders = result;
          this.totalRecords = result.length;
        } else if (result && result.result) {
          rawOrders = result.result;
          this.totalRecords = result.totalCount || result.total || rawOrders.length;
        }

        this.orders = rawOrders.map((o: any) => {
          const currentStatus = o.orderStatus !== undefined && o.orderStatus !== null ? o.orderStatus :
            (o.status !== undefined && o.status !== null ? o.status : (o.orderStatusLabel || 'Pending'));

          return {
            id: o.orderId || o.id,
            orderId: o.orderNo || o.orderId || o.id || 'N/A',
            orderDate: new Date(o.createDate || o.orderDate || Date.now()),
            status: currentStatus,
            totalAmount: o.totalAmount || 0,
            items: (o.orderItems || o.items || []).map((i: any) => ({
              name: i.productName || i.name || '商品名稱',
              quantity: i.quantity || 1,
              price: i.price || i.unitPrice || 0
            }))
          };
        });
      },
      error: (err) => {
        console.error('Failed to fetch orders', err);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadOrders(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSearchChange(): void {
    this.loadOrders(1);
  }

  // 輔助功能：根據狀態回傳對應的 CSS Class 名稱
  getStatusClass(status: string | number): string {
    const s = String(status);
    switch (s) {
      case '0': case 'Pending': return 'status-pending';
      case '1': case 'Shipped': return 'status-shipped';
      case '2': case 'Completed': return 'status-completed';
      case '3': case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  // 輔助功能：翻譯狀態成中文
  getStatusLabel(status: string | number): string {
    const s = String(status);
    const statusMap: Record<string, string> = {
      // '0': '處理中',
      // 'Pending': '待付款',
      // '1': '運送中',
      // 'Shipped': '配送中',
      // '2': '已完成',
      // 'Completed': '已完成',
      // '3': '已取消',
      // 'Cancelled': '已取消'
      '0': '處理中',
      'Pending': '待付款',
      '1': '待付款',
      'Shipped': '配送中',
      '2': '已完成',
      'Completed': '已完成',
      '3': '已取消',
      'Cancelled': '已取消'
    };
    return statusMap[s] || s;
  }

  // 因為現在是伺服器分頁，filteredOrders 只需要回傳當前頁面的 items
  get filteredOrders(): Order[] {
    return this.orders;
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.loadOrders(1);
  }

  viewDetails(id: number): void {
    const listOrder = this.orders.find(o => o.id === id);
    console.log('正在查看訂單 ID:', id, '對應清單資料:', listOrder);

    this.orderService.getOrderDetailByApi2(id).subscribe({
      next: (details) => {
        console.log('從 API 取得的訂單詳情原始資料:', details);

        if (!details) {
          alert('查無此訂單詳情資料');
          return;
        }

        // 根據使用者提供的資料結構，更新對應的欄位映射
        this.selectedOrderDetails = {
          ...listOrder,
          ...details,
          // 優先選用細節介面的欄位
          orderNo: details.orderNo || listOrder?.orderId || 'N/A',
          createDate: details.createDate || listOrder?.orderDate,
          shippingFee: details.shippingFee || 0,
          selectedPayment: details.selectedPayment,
          // 處理後端可能的拼錯 (discointAmount) 並對應到前端 discountAmount
          discountAmount: (details as any).discointAmount !== undefined ? (details as any).discointAmount : (details.discountAmount || 0),
          // 紅利部分對應 UsedPoints
          usedPoints: details.usedPoints || (details as any).UsedPoints || 0,

          // 欄位轉換：確保與 HTML 模板使用的欄位一致 (productName, unitPrice, productImage)
          items: (details.items || []).map((i: any) => ({
            productName: i.productName || '未知商品',
            quantity: i.quantity || 1,
            unitPrice: i.unitPriceAtPurchase || i.priceAtPurchase || 0,
            productImage: i.productImage || i.imageUrl || 'assets/images/default-product.png'
          }))
        };

        console.log('處理後的彈窗資料:', this.selectedOrderDetails);
        this.showModal = true;
      },
      error: (err) => {
        console.error('抓取訂單詳情失敗:', err);
        alert('無法取得訂單詳情 (404 或 路徑錯誤)');
      }
    });
  }

  continuePayment(order: any): void {
    console.log('準備繼續付款, 訂單 ID:', order.id);
    this.ecpayService.getPaymentParams(order.id).subscribe({
      next: (response) => {
        if (response.success && response.htmlForm) {
          this.executeEcpayForm(response.htmlForm);
        } else {
          alert(response.message || '無法取得付款參數');
        }
      },
      error: (err) => {
        console.error('取得金流參數失敗:', err);
        alert('系統錯誤，請連繫客服');
      }
    });
  }

  cancelOrder(order: any): void {
    if (confirm(`確定要取消訂單 #${order.orderId} 嗎？`)) {
      console.log('執行取消訂單, 訂單 ID:', order.id);
      this.orderService.cancelOrder(order.id).subscribe({
        next: (success) => {
          if (success) {
            alert('訂單已成功取消');
            this.closeModal();
            this.ngOnInit(); // 重新整理列表
          } else {
            alert('取消訂單失敗，請稍後再試');
          }
        },
        error: (err) => {
          console.error('取消訂單時發生錯誤:', err);
          alert('系統錯誤，無法取消訂單');
        }
      });
    }
  }

  private executeEcpayForm(htmlForm: string) {
    const div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = htmlForm;
    document.body.appendChild(div);

    const form = div.querySelector('form');
    if (form) {
      form.submit();
    } else {
      console.error('無法解析綠界表單');
      alert('跳轉金流失敗，請連繫客服');
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrderDetails = null;
  }
}
