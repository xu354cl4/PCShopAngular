import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { OrderDetail } from '../../models/Order.model';
import { OrderApiService } from '../../Services/order-api.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-member-order-detail',
  imports: [CommonModule],
  templateUrl: './member-order-detail.component.html',
  styleUrl: './member-order-detail.component.css'
})
export class MemberOrderDetailComponent implements OnChanges{
@Input() orderId!: number;
@Output() close = new EventEmitter<void>();

order?: OrderDetail;

constructor(private orderService:OrderApiService){}

ngOnChanges() {
 if (!this.orderId) return;

  this.orderService
    .getOrderDetail(this.orderId)
    .subscribe(res => this.order = res);
}

}
