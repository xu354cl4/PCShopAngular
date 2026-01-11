import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { OrderDetail } from '../../models/order.model';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-member-order-detail',
  imports: [CommonModule],
  templateUrl: './member-order-detail.component.html',
  styleUrl: './member-order-detail.component.css'
})
export class MemberOrderDetailComponent implements OnChanges {
  @Input() orderId!: number;
  @Output() close = new EventEmitter<void>();

  order?: OrderDetail;

  constructor(private orderService: OrderApiService) { }

  ngOnChanges() {
    if (!this.orderId) return;

    this.orderService
      .getOrderDetail(this.orderId)
      .subscribe(res => {
        // 將後端的 OrderDetailDto 映射為前端用的 OrderDetail 介面
        // 樣板中預期 status 為 'Pending' | 'Shipping' | 'Completed'
        const statusMap: any = {
          0: 'Pending',
          1: 'Shipping',
          2: 'Completed'
        };

        this.order = {
          orderId: res.orderId,
          orderNo: res.orderNo,
          status: statusMap[res.orderStatus] || res.statusName || 'Pending',
          totalAmount: res.totalAmount,
          receiverName: res.receiverName,
          shippingMethodName: res.shippingMethodName,
          shippingAddress: res.shippingAddress,
          receiverPhone: res.receiverPhone,
          items: (res.items || []).map(item => ({
            productName: item.productName,
            productImage: item.imageUrl,
            unitPriceAtPurchase: item.priceAtPurchase || 0,
            quantity: item.quantity
          }))
        };
      });
  }

}
