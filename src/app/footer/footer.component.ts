import { Component } from '@angular/core';
import { AdSlotComponent } from "../ad-slot/ad-slot.component";

@Component({
  selector: 'app-footer',
  imports: [AdSlotComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

}
