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


type MainView = 'overview' | 'orders' | 'settings' | 'benefits';
type OrderView = 'all' | 'pending' | 'shipping' | 'completed';
type SettingsView = 'profile' | 'address' | 'security';
type BenefitsView = 'coupon' | 'coin' | 'activity';

@Component({
  selector: 'app-membercenter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MemberProfileComponent, MemberSecurityComponent, MemberAddressComponent, MemberOrderPendingComponent, MemberOrderShippingComponent, MemberOrderHistoryComponent, MemberOrderDetailComponent],
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


  selectedOrderId: number | null = null;
  constructor(private api: MemberApiService) { }

  ngOnInit(): void {
    this.loadOverview();
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
    filterStatus: undefined as string | undefined,
    keyword: undefined as string | undefined
  };
  openOrderDetail(orderId: number) {
    this.selectedOrderId = orderId;
  }

  closeOrderDetail() {
    this.selectedOrderId = null;
  }
}
