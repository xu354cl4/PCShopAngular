import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-order-history',
  standalone:true ,
  imports: [CommonModule],
  templateUrl: './member-order-history.component.html',
  styleUrl: './member-order-history.component.css'
})
export class MemberOrderHistoryComponent implements OnInit{
 @Output() openDetail = new EventEmitter<number>();
  orders: any[] = [];


  constructor(private orderService : OrderApiService){}
ngOnInit() {
  this.orderService
    .getOrders('Completed')
    .subscribe(res => this.orders = res);
}
goDetail(orderId: number) {
  this.openDetail.emit(orderId);
}
}
