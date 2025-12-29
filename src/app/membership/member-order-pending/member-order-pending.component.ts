import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-member-order-pending',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './member-order-pending.component.html',
  styleUrl: './member-order-pending.component.css'
})
export class MemberOrderPendingComponent implements OnInit{
  @Output() openDetail = new EventEmitter<number>();
  orders: any[] = [];


  constructor(private orderService : OrderApiService){}
ngOnInit() {
  this.orderService
    .getOrders('Pending')
    .subscribe(res => this.orders = res);
}
goDetail(orderId: number) {
  this.openDetail.emit(orderId);
}

}
