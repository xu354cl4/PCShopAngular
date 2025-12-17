import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MenuItem } from 'primeng/api';

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
    CardModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  steps: MenuItem[] | undefined;
  activeIndex: number = 1; // Index 1 is the second step (0-based)
  checkoutForm: FormGroup;

  // 模擬數據
  totalAmount = 3580;
  totalItems = 4;

  countryCodes = [
    { label: 'TW +886', value: '+886' },
    { label: 'US +1', value: '+1' },
    { label: 'JP +81', value: '+81' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
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
        recipientPhone: ['', Validators.required],
        storeName: ['台北信義門市'] // 預設或選取後的門市
      })
    });
  }

  ngOnInit() {
    this.steps = [
      { label: '購物車' },
      { label: '填寫資料' },
      { label: '訂單確認' }
    ];

    // 監聽 "同顧客資料" Checkbox 變化
    this.checkoutForm.get('delivery.sameAsCustomer')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((checked) => {
        if (checked) {
          this.syncCustomerToDelivery();
        } else {
          // 若取消勾選，可選擇清空或保留，這裡示範保留不做動作
          // this.checkoutForm.get('delivery')?.patchValue({ recipientName: '', recipientPhone: '' });
        }
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
    const customer = this.checkoutForm.get('customer')?.value;
    this.checkoutForm.get('delivery')?.patchValue({
      recipientName: customer.name,
      recipientPhone: customer.phone
    }, { emitEvent: false }); // 避免無窮迴圈
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      console.log('Form Data:', this.checkoutForm.value);
      // Proceed to next step
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

}
