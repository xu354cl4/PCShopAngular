import { MemberProfile } from './../models/member.models';
import { Component, OnInit } from '@angular/core';
import { MemberApiService } from '../Services/member-api.service';
import { MemberOverview, MemberProfileEdit } from '../models/member.models';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberProfileComponent } from '../membership/member-profile/member-profile.component';
import { MemberSecurityComponent } from '../membership/member-security/member-security.component';
import { MemberAddressComponent } from '../membership/member-address/member-address.component';
import { MemberOrderPendingComponent } from "../membership/member-order-pending/member-order-pending.component";
import { MemberOrderShippingComponent } from "../membership/member-order-shipping/member-order-shipping.component";
import { MemberOrderHistoryComponent } from "../membership/member-order-history/member-order-history.component";
import { MemberOrderDetailComponent } from '../membership/member-order-detail/member-order-detail.component';
import { MemberBenefitsCouponComponent } from "../membership/member-benefits-coupon/member-benefits-coupon.component";
import { MemberBenefitsCoinComponent } from "../membership/member-benefits-coin/member-benefits-coin.component";
import { MemberBenefitsFootprintsComponent } from "../membership/member-benefits-footprints/member-benefits-footprints.component";
import { OrderListComponent } from '../order-list/order-list.component';


type MainView = 'overview' | 'orders' | 'settings' | 'benefits';
type OrderView = 'all' | 'pending' | 'completed' | 'cancelled';
type SettingsView = 'profile' | 'address' | 'security';
type BenefitsView = 'coupon' | 'coin' | 'activity';

@Component({
  selector: 'app-membercenter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MemberProfileComponent, MemberSecurityComponent, MemberAddressComponent, MemberOrderPendingComponent, MemberOrderShippingComponent, MemberOrderHistoryComponent, MemberOrderDetailComponent, MemberBenefitsCouponComponent, MemberBenefitsCoinComponent, MemberBenefitsFootprintsComponent, OrderListComponent],
  templateUrl: './membercenter.component.html',
  styleUrl: './membercenter.component.css'
})


export class MembercenterComponent implements OnInit {

  mainView: MainView = 'overview';
  orderView: OrderView = 'pending';
  settingsView: SettingsView = 'profile';
  benefitsView: BenefitsView = 'coupon';

  overview?: MemberOverview;
  loading = false;
  error = '';
  points = 0;
  loadingPoints = false;

  selectedOrderId: number | null = null;
  constructor(private api: MemberApiService) { }

  ngOnInit(): void {
    this.loadOverview();
    this.loadPoints();
  }

  loadOverview() {
    this.loading = true;
    this.error = '';

    this.api.getOverview().subscribe({
      next: res => {
        this.overview = res;
        this.loading = false;
      },
      error: () => {
        this.error = '載入失敗';
        this.loading = false;
      }
    });
  }

  loadPoints() {
    this.loadingPoints = true;

    this.api.getMyPoints().subscribe({
      next: res => {
        this.points = res.points;
        this.loadingPoints = false;
      },
      error: () => {
        this.points = 0;
        this.loadingPoints = false;
      }
    });
  }
  onProfileSaved() {
    this.loadOverview();          // 讓 overview 的顯示資料更新
    this.mainView = 'overview';   // 可選：存完回總覽（不想回去就拿掉這行）
  }

  onAvatarChanged(url: string) {
    // 1) 如果你的 header 是吃 localStorage 的 user
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      user.imageUrl = url;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  orderListState = {
    page: 1,
    pageSize: 4,
    keyword: undefined as string | undefined
  };
  openOrderDetail(orderId: number) {
    this.selectedOrderId = orderId;
  }

  closeOrderDetail() {
    this.selectedOrderId = null;
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': '待付款',
      'shipping': '待付款', // 或者您可以改成 配送中
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  }
}
