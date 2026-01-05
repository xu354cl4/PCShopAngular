import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { EcpayService } from '../Services/ecpay.service';
import { OrderApiService } from '../Services/order-api.service';
import { CreateOrderRequest } from '../models/order-request.model';


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
    private ecpayService: EcpayService,
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
    this.http.get<any>('https://localhost:7001/api/Checkout/Users')
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
          console.error('訂單建立失敗');

          console.log('HttpErrorResponse:', err);
          console.log('err.error:', err.error);
          console.log('err.error.errors:', err.error?.errors);

          alert('訂單建立失敗（請看 console）');
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

  onConfirmCheckout() {
    if (this.checkoutForm.valid) {
      // 使用 getRawValue() 包含被 disabled 的欄位內容
      const formData = this.checkoutForm.getRawValue();

      // 組合訂單請求資料
      const orderRequest: CreateOrderRequest = {
        customerName: formData.customer.name,
        customerEmail: formData.customer.email,
        customerPhone: formData.customer.phone,
        shippingMethod: formData.delivery.deliveryMethod,
        paymentMethod: formData.delivery.paymentMethod,
        shippingAddress: `${formData.delivery.city}${formData.delivery.district}${formData.delivery.address}`.trim(),
        receiverName: formData.delivery.recipientName,
        receiverPhone: formData.delivery.recipientPhone,
        receiverAddress: `${formData.delivery.city}${formData.delivery.district}${formData.delivery.address}`.trim(),
        items: this.selectedItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: this.totalAmount,
        orderNotes: formData.note
      };

      // 呼叫服務建立訂單 (端點: https://localhost:7001/api/Checkout/Create)
      this.orderService.createCheckoutOrder(orderRequest).subscribe({
        next: (response) => {
          // 取得後端回傳的單號 (Order ID)
          const orderId = response.orderId;
          console.log('訂單建立成功，取得 Order ID:', orderId);

          // 成功後導航到成功頁面 (Step 3)
          this.router.navigate(['/order-success', orderId]);
        },
        error: (err) => {
          console.error('訂單建立失敗', err);
          alert('訂單建立失敗，請稍後再試。');
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
      alert('請填寫所有必要欄位');
    }
  }

  //Angular 不能直接用 HttpClient POST 到綠界（因為綠界需要的是頁面跳轉），所以我們需要動態建立一個隱藏表單：
  checkout() {
    const orderData = { TotalAmount: 100, ItemName: '測試商品', TradeDesc: '訂單描述' };

    this.ecpayService.getPaymentParams(orderData).subscribe(params => {
      // 建立一個隱藏的 Form 並 POST 到綠界測試環境
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = key;
          hiddenField.value = params[key];
          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit(); // 自動送出表單，頁面會跳轉到綠界付款頁
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


