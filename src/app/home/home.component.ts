import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdSlotComponent } from "../ad-slot/ad-slot.component";


declare var bootstrap: any;   // 告訴 TypeScript 外部有 bootstrap 物件

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AdSlotComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  ngAfterViewInit(): void {
    const carouselEl = document.querySelector('#carouselExampleInterval');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        ride: 'carousel'      // 啟動自動輪播
      });
    }
  }
}
