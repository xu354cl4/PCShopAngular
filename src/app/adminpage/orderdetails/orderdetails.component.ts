import { AdminApiService } from './../../Services/admin-api.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrderDetail } from '../../models/Order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orderdetails',
  imports: [CommonModule],
  templateUrl: './orderdetails.component.html',
  styleUrl: './orderdetails.component.css'
})
export class OrderdetailsComponent {
  @Input() orderId!: number;
  @Output() close = new EventEmitter<void>();

  order?: OrderDetail;

  constructor(private adminService: AdminApiService) { }

  ngOnChanges() {
    if (!this.orderId) return;

    this.adminService
      .getOrderDetail(this.orderId)
      .subscribe(res => this.order = res);
  }


}
