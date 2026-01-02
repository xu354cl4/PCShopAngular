import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-order-shipping',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './member-order-shipping.component.html',
  styleUrl: './member-order-shipping.component.css'
})
export class MemberOrderShippingComponent implements OnInit{
@Output() openDetail = new EventEmitter<number>();
  orders: any[] = [];


  constructor(private orderService : OrderApiService){}
ngOnInit() {
  this.orderService
    .getOrders('Shipping')
    .subscribe(res => this.orders = res);
}
goDetail(orderId: number) {
  this.openDetail.emit(orderId);
}
}
