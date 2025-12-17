import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  orderId: string;        // 訂單編號 (例如: ORD-2023121001)
  orderDate: Date;        // 下單日期
  status: 'Pending' | 'Shipped' | 'Completed' | 'Cancelled'; // 訂單狀態
  totalAmount: number;    // 訂單總金額
  items: OrderItem[];     // 購買的商品列表
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
// export class OrderListComponent {

//   // 2. 建立訂單假資料 (Mock Data)
//   orders: Order[] = [
//     {
//       orderId: 'ORD-2025121001',
//       orderDate: new Date('2025-12-10T10:30:00'),
//       status: 'Pending', // 處理中
//       totalAmount: 4580,
//       items: [
//         { name: '羅技 MX Master 3S', quantity: 1, price: 3290 },
//         { name: '大桌墊', quantity: 1, price: 1290 }
//       ]
//     },
//     {
//       orderId: 'ORD-2025120805',
//       orderDate: new Date('2025-12-08T14:20:00'),
//       status: 'Shipped', // 已出貨
//       totalAmount: 15900,
//       items: [
//         { name: 'Dell 27吋 4K 螢幕', quantity: 1, price: 15900 }
//       ]
//     },
//     {
//       orderId: 'ORD-2025112503',
//       orderDate: new Date('2025-11-25T09:15:00'),
//       status: 'Completed', // 已完成
//       totalAmount: 2890,
//       items: [
//         { name: 'Keychron K2 機械鍵盤', quantity: 1, price: 2890 }
//       ]
//     },
//     {
//       orderId: 'ORD-2025112009',
//       orderDate: new Date('2025-11-20T18:00:00'),
//       status: 'Cancelled', // 已取消
//       totalAmount: 9900,
//       items: [
//         { name: 'Sony 降噪耳機', quantity: 1, price: 9900 }
//       ]
//     }
//   ];
// }

//API串接//
export class OrderListComponent implements OnInit {

  http = inject(HttpClient);
  orders: Order[] = [];

  ngOnInit(): void {
    this.http.get<any[]>('https://localhost:7213/api/Order').subscribe({
      next: (result) => {
        // Map API result to Order interface
        // 假設 API 回傳格式為 camelCase JSON (standard .NET Core default)
        this.orders = result.map(o => ({
          orderId: o.orderNo,
          orderDate: new Date(o.createDate),
          status: o.orderStatus,
          totalAmount: o.totalAmount,
          items: o.orderItems.map((i: any) => ({
            name: i.productName,
            quantity: i.quantity,
            price: i.price
          }))
        }));
      },
      error: (err) => {
        console.error('Failed to fetch orders', err);
      }
    });
  }

  // 輔助功能：根據狀態回傳對應的 CSS Class 名稱
  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Shipped': return 'status-shipped';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  // 輔助功能：翻譯狀態成中文
  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'Pending': '處理中',
      'Shipped': '運送中',
      'Completed': '已完成',
      'Cancelled': '已取消'
    };
    return statusMap[status] || status;
  }

}
