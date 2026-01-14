import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, startWith } from 'rxjs';
import { OrderApiService } from '../Services/order-api.service';
import { CreateOrderRequest, CreateOrderResponse } from '../models/order-request.model';
import { TAIWAN_ADDRESS_DATA } from '../models/taiwan-address-data';
import { EcpayService } from '../Services/ecpay.service';

// PrimeNG Imports
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MenuItem } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    CardModule,
    AccordionModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  steps: MenuItem[] | undefined;
  activeIndex: number = 1; // Index 1 is the second step (0-based)
  checkoutForm: FormGroup;

  // 從購物車傳來的數據
  checkoutData: any;
  totalAmount = 0;
  totalItems = 0;
  selectedItems: any[] = [];
  subTotal = 0;
  discountAmount = 0;
  usePoints = 0; // 新增：使用的點數

  countryCodes = [
    { label: 'TW +886', value: '+886' },
    { label: 'US +1', value: '+1' },
    { label: 'JP +81', value: '+81' }
  ];

  deliveryLocations = [
    { label: '台灣', value: 'TW' }
  ];


  // 這邊是前端寫死,要撈後端的運送方式
  deliveryMethods = [
    { label: '本島宅配', value: 'mainland_delivery' },
    { label: '台灣離島宅配', value: 'island_delivery' },
    { label: '7-11門市自取', value: 'CVS' }
  ];

  paymentMethods = [
    { label: '信用卡付款', value: 'Credit' },
    { label: '「綠界金流 ATM 虛擬帳號」', value: 'ATM' },
    { label: '貨到付款', value: 'COD' },
    { label: '「綠界金流」', value: 'ecpay' }
  ];

  cities = Object.keys(TAIWAN_ADDRESS_DATA);
  districts: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private orderService: OrderApiService,
    private ecpayService: EcpayService
  ) {
    // 獲取路由轉場時帶過來的 state 資料
    const navigation = this.router.getCurrentNavigation();
    this.checkoutData = navigation?.extras.state?.['data'] || history.state?.['data'];

    if (this.checkoutData) {
      this.selectedItems = this.checkoutData.selectedItems || [];
      this.subTotal = this.checkoutData.subTotal || 0;
      this.discountAmount = this.checkoutData.discountAmount || 0;
      this.usePoints = this.checkoutData.usePoints || 0; // 新增
      this.totalAmount = this.checkoutData.totalAmount || 0;
      this.totalItems = this.selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    }

    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        countryCode: ['+886'],
        phone: ['', Validators.required]
      }),
      note: [''],
      delivery: this.fb.group({
        deliveryLocation: ['TW', Validators.required],
        deliveryMethod: ['mainland_delivery', Validators.required],
        paymentMethod: ['Credit', Validators.required],
        sameAsCustomer: [false],
        recipientName: ['', Validators.required],
        recipientCountryCode: ['+886'],
        recipientPhone: ['', Validators.required],
        city: ['', Validators.required],
        district: ['', Validators.required],
        address: ['', Validators.required],
        storeName: [''] // 預設或選取後的門市
      })
    });
  }

  ngOnInit() {
    // 如果沒有資料（可能是刷新的），導回購物車
    if (!this.checkoutData) {
      alert('無結帳資料，將導回購物車');
      this.router.navigate(['/cart']);
      return;
    }

    this.steps = [
      { label: '購物車' },
      { label: '填寫資料' },
      { label: '訂單確認' }
    ];
    console.log('呼叫userdata');
    this.fetchUserData();

    // 監聽 "同顧客資料" Checkbox 變化
    this.checkoutForm.get('delivery.sameAsCustomer')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.syncCustomerToDelivery();
      });

    // 監聽顧客資料變化，若 Checkbox 勾選中，即時同步
    this.checkoutForm.get('customer')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.checkoutForm.get('delivery.sameAsCustomer')?.value) {
          this.syncCustomerToDelivery();
        }
      });

    // 監聽縣市變化以更新鄉鎮市區
    this.checkoutForm.get('delivery.city')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((city) => {
        this.districts = TAIWAN_ADDRESS_DATA[city] || [];
        // 當縣市改變時，清空原本選取的鄉鎮市區
        this.checkoutForm.get('delivery.district')?.setValue('', { emitEvent: false });
      });

    // 監聽送貨方式以啟用/停用地址欄位
    this.checkoutForm.get('delivery.deliveryMethod')?.valueChanges
      .pipe(takeUntil(this.destroy$), startWith(this.checkoutForm.get('delivery.deliveryMethod')?.value))
      .subscribe((method) => {
        const cityCtrl = this.checkoutForm.get('delivery.city');
        const districtCtrl = this.checkoutForm.get('delivery.district');
        const addressCtrl = this.checkoutForm.get('delivery.address');

        if (method === 'CVS') {
          cityCtrl?.disable();
          districtCtrl?.disable();
          addressCtrl?.disable();
        } else {
          cityCtrl?.enable();
          districtCtrl?.enable();
          addressCtrl?.enable();
        }
      });

    // 監聽綠界門市選擇回傳
    window.addEventListener('message', this.handleLogisticsMessage);
  }

  // 處理綠界門市回傳訊息 (使用箭頭函式以保持 this 語境)
  private handleLogisticsMessage = (event: MessageEvent) => {
    // 這裡可以檢查 event.origin 確保安全性
    const storeData = event.data;

    // 檢查回傳資料格式是否符合預期
    if (storeData && storeData.storeId && storeData.storeName) {
      console.log('收到門市資訊:', storeData);
      
      this.checkoutForm.get('delivery')?.patchValue({
        storeName: `${storeData.storeName} (${storeData.storeId})`,
        // 如果有需要也可以把地址存進去
        address: storeData.storeAddress
      });
    }
  };

  // 同步邏輯 helper
  private syncCustomerToDelivery() {
    const isSame = this.checkoutForm.get('delivery.sameAsCustomer')?.value;
    const recipientName = this.checkoutForm.get('delivery.recipientName');
    const recipientPhone = this.checkoutForm.get('delivery.recipientPhone');

    if (isSame) {
      const customer = this.checkoutForm.get('customer')?.value;
      this.checkoutForm.get('delivery')?.patchValue({
        recipientName: customer.name,
        recipientCountryCode: customer.countryCode,
        recipientPhone: customer.phone
      }, { emitEvent: false });

      recipientName?.disable();
      this.checkoutForm.get('delivery.recipientCountryCode')?.disable();
      recipientPhone?.disable();
    } else {
      recipientName?.enable();
      this.checkoutForm.get('delivery.recipientCountryCode')?.enable();
      recipientPhone?.enable();

      // 當取消勾選時，清空收件人資訊
      this.checkoutForm.get('delivery')?.patchValue({
        recipientName: '',
        recipientCountryCode: '+886',
        recipientPhone: ''
      }, { emitEvent: false });
    }
  }

  private fetchUserData() {
    this.http.get<any>('https://localhost:7001/api/Checkout/Users')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('user', user);
          if (user) {
            this.checkoutForm.get('customer')?.patchValue({
              name: user.name || user.fullName || '',
              email: user.email || user.mail || '',
              phone: user.phone || ''
            });

            // 如果當前勾選了 "同顧客資料"，則也更新收件人資訊
            if (this.checkoutForm.get('delivery.sameAsCustomer')?.value) {
              this.syncCustomerToDelivery();
            }
          }
        },
        error: (err) => {
          console.error('獲取使用者資料失敗', err);
        }
        // error: (err) => {
        //   console.error('獲取使用者資料失敗', err);
        // }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // 移除監聽器
    window.removeEventListener('message', this.handleLogisticsMessage);
  }
  //更新executeEcpayForm方法
  onConfirmCheckout() {
    console.log('onConfirmCheckout 被觸發');

    // 1. 表單驗證
    if (this.checkoutForm.invalid) {
      console.warn('表單驗證失敗，請檢查欄位狀況:', this.checkoutForm.controls);
      this.checkoutForm.markAllAsTouched();
      alert('請填寫所有必要欄位');
      return;
    }

    // 2. 準備資料
    const formData = this.checkoutForm.getRawValue();

    // 根據運送方式決定地址
    const address = formData.delivery.deliveryMethod === 'CVS'
      ? `${formData.delivery.address}(${formData.delivery.storeName})`.trim()
      : `${formData.delivery.city}${formData.delivery.district}${formData.delivery.address}`.trim();

    // 組合訂單請求物件
    const orderRequest: CreateOrderRequest = {
      shippingMethodId: formData.delivery.deliveryMethodId,
      shippingMethod: formData.delivery.deliveryMethod,
      paymentMethod: formData.delivery.paymentMethod,
      shippingAddress: address,
      receiverName: formData.delivery.recipientName,
      receiverPhone: formData.delivery.recipientPhone,
      // items: this.selectedItems.map(item => ({
      //   productId: item.productId,
      //   name: item.name,
      //   price: item.price,
      //   quantity: item.quantity
      // })),
      usePoints: this.usePoints || 0,
      userCouponId: this.checkoutData?.selectedCoupon?.userCouponId || null,
    };

    console.log('送出的訂單內容:', orderRequest);

    // 3. 呼叫 API 建立訂單
    this.orderService.createCheckoutOrder(orderRequest).subscribe({
      next: (response: CreateOrderResponse) => {
        if (response.success) {
          if (response.htmlForm) {
            console.log('取得綠界表單，執行跳轉...');
            this.executeEcpayForm(response.htmlForm);
          } else {
            console.log('訂單建立成功，導向成功頁');
            this.router.navigate(['/order-success', response.orderId]);
          }
        } else {
          alert(response.message || '訂單建立失敗');
        }
      },
      error: (err) => {
        console.error('API 錯誤:', err);
        alert('系統發生錯誤，請稍後再試。');
      }
    });
  }

  /**
   * 提交資料到綠界金流
   * @param htmlForm 綠界回傳的 HTML 表單字串
   * @param target 提交對象，預設 _self (當前頁面)，若為物流地圖建議用新視窗
   */
  private executeEcpayForm(htmlForm: string, target: string = '_self') {
    // 建立一個隱藏的 div 來放置 HTML
    const div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = htmlForm;
    document.body.appendChild(div);

    // 尋找表單並提交
    const form = div.querySelector('form');
    if (form) {
      if (target !== '_self') {
        // 設定新視窗參數
        const width = 1000;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open('', target, `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
        form.target = target;
      }
      form.submit();
    } else {
      console.error('無法解析綠界表單');
      alert('跳轉金流失敗，請聯繫客服');
    }
  }

  /**
   * 開啟綠界門市地圖
   */
  onSelectStore() {
    const logisticsData = {
      logisticsType: 'CVS',
      logisticsSubType: 'UNIMART',
      isCollection: 'N',
      extraData: '' // 可以帶入一些自定義資料，在回傳時會帶回
    };

    this.ecpayService.getLogisticsMap(logisticsData).subscribe({
      next: (response) => {
        if (response.success && response.htmlForm) {
          // 使用新窗口打開門市地圖
          this.executeEcpayForm(response.htmlForm, 'ecpayMapPopup');
        } else {
          alert(response.message || '無法開啟門市地圖');
        }
      },
      error: (err) => {
        console.error('開啟門市地圖失敗:', err);
        alert('系統錯誤，無法開啟門市地圖');
      }
    });
  }
}

// AI
//實作重點總結：
// 動態取得 ID：程式碼會等待後端回傳 { orderId: number } 的 JSON 物件，並從中提取 ID。
// 明確端點：服務層已明確指向 https://localhost:7001/api/Checkout/Create。
// 資料對接：在 items 映射中同時考慮了 productId 與
// id
//  欄位，確保資料來源（購物車）能正確轉化為訂單細項。
// 流程串接：成功取得 ID 後立即觸發路由跳轉至 /order-success/:orderId。


