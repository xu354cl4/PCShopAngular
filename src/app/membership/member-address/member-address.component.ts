import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { ReactiveFormsModule, FormControl  , FormGroup} from '@angular/forms';
import { MemberApiService } from '../../Services/member-api.service';

@Component({
  selector: 'app-member-address',
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './member-address.component.html',
  styleUrl: './member-address.component.css'
})
export class MemberAddressComponent implements OnInit {
  loading=false; error=''; success='';

  form = new FormGroup({
  address: new FormControl('', { nonNullable:true }),
  shippingAddress: new FormControl('', { nonNullable:true })
});

  constructor(private api: MemberApiService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading=true; this.error=''; this.success='';
    this.api.getAddress().subscribe({
      next: (res) => { this.form.patchValue(res); this.loading=false; },
      error: () => { this.error='載入地址失敗'; this.loading=false; }
    });
  }

  save() {
    this.loading=true; this.error=''; this.success='';
    this.api.updateAddress(this.form.getRawValue() as any).subscribe({
      next: () => { this.loading=false; this.success='儲存成功'; },
      error: (err) => { this.loading=false; this.error=err?.error?.message ?? '儲存失敗'; }
    });
  }
}
