// src/app/pages/ads-playground/ads-playground.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdSlotComponent } from '../../ad-slot/ad-slot.component';
import { AdsSlotRegistryService } from '../../Services/ads-slot-registry.service';

@Component({
  selector: 'app-ads-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, AdSlotComponent],
  templateUrl: './ads-playground.component.html',
  styleUrls: ['./ads-playground.component.css']
})
export class AdsPlaygroundComponent {
  showTop = true;
  showBottom = true;
  showRight = true;

  constructor(public slots: AdsSlotRegistryService) { }
}
