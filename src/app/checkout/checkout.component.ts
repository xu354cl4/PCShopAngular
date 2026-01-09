import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { OrderApiService } from '../Services/order-api.service';
import { CreateOrderRequest, CreateOrderResponse } from '../models/order-request.model';

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
    { label: '門市自取', value: 'store_pickup' }
  ];

  paymentMethods = [
    { label: '信用卡付款', value: 'Credit' },
    { label: '「綠界金流 ATM 虛擬帳號」', value: 'ATM' },
    { label: '貨到付款', value: 'COD' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private orderService: OrderApiService
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
        city: [''],
        district: [''],
        address: [''],
        storeName: ['台北信義門市'] // 預設或選取後的門市
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
  }

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
    this.http.get<any>('/api/Checkout/Users')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
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
  }
  //更新executeEcpayForm方法
  onConfirmCheckout() {
    console.log('onConfirmCheckout 被觸發');
    console.log('表單狀態:', this.checkoutForm.valid ? '有效' : '無效');

    // 1. 表單驗證
    if (this.checkoutForm.invalid) {
      console.warn('表單驗證失敗，請檢查欄位狀況:', this.checkoutForm.controls);
      this.checkoutForm.markAllAsTouched();
      alert('請填寫所有必要欄位');
      return;
    }

    // 2. 準備資料
    // 使用 getRawValue() 以包含被 disabled 的欄位 (如自動帶入的收件人資料)
    const formData = this.checkoutForm.getRawValue();
    console.log('送出的表單原始資料:', formData);

    // 根據運送方式決定地址邏輯
    const address = formData.delivery.deliveryMethod === 'store_pickup'
      ? formData.delivery.storeName
      : `${formData.delivery.city}${formData.delivery.district}${formData.delivery.address}`.trim();

    // 組合訂單請求物件 (CreateOrderRequest)
    const orderRequest: CreateOrderRequest = {
      customerName: formData.customer.name,
      customerEmail: formData.customer.email,
      customerPhone: formData.customer.phone,
      shippingMethod: formData.delivery.deliveryMethod,
      paymentMethod: formData.delivery.paymentMethod,
      shippingAddress: address,
      receiverName: formData.delivery.recipientName,
      receiverPhone: formData.delivery.recipientPhone,
      receiverAddress: address,
      items: this.selectedItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: this.totalAmount,
      usedPoints: this.usePoints || 0,
      userCouponId: this.checkoutData?.selectedCoupon?.userCouponID || null,
      shippingFee: 0,
      orderNotes: formData.note
    };

    console.log('即時準備送出的訂單內容:', orderRequest);

    // 3. 呼叫 API 建立訂單
    this.orderService.createCheckoutOrder(orderRequest).subscribe({
      next: (response: CreateOrderResponse) => {
        console.log('API 回傳結果:', response);

        if (response.success) {
          // 判斷邏輯更新：檢查後端是否回傳了綠界專用的 htmlForm
          if (response.htmlForm) {
            console.log('取得綠界表單，準備執行跳轉...');
            // 呼叫新方法執行 HTML 插入與 Submit
            this.executeEcpayForm(response.htmlForm);
          } else {
            // 沒有 htmlForm，代表是一般訂單 (如貨到付款) 或不需要即時付款
            console.log('訂單建立成功，前往成功頁面');
            this.router.navigate(['/order-success', response.orderId]);
          }
        } else {
          // 邏輯上的失敗 (例如庫存不足、點數不夠等)
          alert(response.message || '訂單建立失敗');
        }
      },
      error: (err: any) => {
        console.error('訂單建立 API 系統錯誤:', err);
        alert('系統發生錯誤，請稍後再試。');
      }
    });




    if (this.checkoutForm.valid) {
      // 使用 getRawValue() 包含被 disabled 的欄位內容
      const formData = this.checkoutForm.getRawValue();
      console.log('送出的表單原始資料:', formData);

      // 根據運送方式決定地址
      const address = formData.delivery.deliveryMethod === 'store_pickup'
        ? formData.delivery.storeName
        : `${formData.delivery.city}${formData.delivery.district}${formData.delivery.address}`.trim();

      // 組合訂單請求資料
      const orderRequest: CreateOrderRequest = {
        customerName: formData.customer.name,
        customerEmail: formData.customer.email,
        customerPhone: formData.customer.phone,
        shippingMethod: formData.delivery.deliveryMethod,
        paymentMethod: formData.delivery.paymentMethod,
        shippingAddress: address,
        receiverName: formData.delivery.recipientName,
        receiverPhone: formData.delivery.recipientPhone,
        receiverAddress: address,
        items: this.selectedItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: this.totalAmount,
        usedPoints: this.usePoints || 0,
        userCouponId: this.checkoutData?.selectedCoupon?.userCouponID || null,
        shippingFee: 0,
        orderNotes: formData.note
      };

      console.log('即時準備送出的訂單內容:', orderRequest);

      // 呼叫服務建立訂單 (端點: https://localhost:7001/api/Checkout/Create)
      this.orderService.createCheckoutOrder(orderRequest).subscribe({
        next: (response: CreateOrderResponse) => {
          console.log('API 回傳成功:', response);
          const orderId = response.orderId;

          // ⭐ 修正邏輯：檢查是否有 htmlForm (代表是綠界付款)
          if (response.success && response.htmlForm) {
            console.log('取得綠界表單，準備跳轉...');
            this.executeEcpayForm(response.htmlForm);
          } else {
            // 一般訂單 (如貨到付款) 或無須跳轉，直接導向成功頁
            this.router.navigate(['/order-success', orderId]);
          }
        },
        error: (err: any) => {
          console.error('訂單建立 API 呼叫失敗:', err);
          alert('訂單建立失敗，請稍後再試。');
        }
      });

    } else {
      console.warn('表單驗證失敗，請檢查欄位狀況:', this.checkoutForm.controls);
      this.checkoutForm.markAllAsTouched();
      alert('請填寫所有必要欄位');
    }
  }

  /**
   * 提交資料到綠界金流
   */
  private executeEcpayForm(htmlForm: string) {
    // ✂️ 【新增這行】強制移除後端傳來的自動送出腳本
    // 這樣瀏覽器就絕對不會自己跳轉了
    htmlForm = htmlForm.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");

    // 1. 建立一個隱藏的 div 來放置這段 HTML
    const div = document.createElement('div');
    // div.style.display = 'none'; // 👁️ 【建議】先註解掉這行，直接顯示在畫面上比較好找
    div.innerHTML = htmlForm;

    // 2. 將 div 加入到 body 中
    document.body.appendChild(div);

    // 3. 抓取 form 元素
    const form = div.querySelector('form');

    if (form) {
      console.log('表單已建立，自動跳轉已攔截！請檢查 Elements 面板');
      console.log(form); // 也可以直接在 Console 印出這個 form 物件來看
    } else {
      console.error('無法解析綠界表單，HTML內容:', htmlForm);
      alert('跳轉金流失敗，請聯繫客服');
    }
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


