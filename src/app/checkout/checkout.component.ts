import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

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

  countryCodes = [
    { label: 'TW +886', value: '+886' },
    { label: 'US +1', value: '+1' },
    { label: 'JP +81', value: '+81' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    // 獲取路由轉場時帶過來的 state 資料
    const navigation = this.router.getCurrentNavigation();
    this.checkoutData = navigation?.extras.state?.['data'];

    if (this.checkoutData) {
      this.totalAmount = this.checkoutData.totalAmount;
      this.selectedItems = this.checkoutData.selectedItems;
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
        sameAsCustomer: [false],
        recipientName: ['', Validators.required],
        recipientCountryCode: ['+886'],
        recipientPhone: ['', Validators.required],
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
          console.error('獲取使用者資料失敗', err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      // 使用 getRawValue() 包含被 disabled 的欄位內容
      const formData = this.checkoutForm.getRawValue();
      console.log('Form Data:', formData);
      // Proceed to next step
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

}
