import { Component } from '@angular/core';

@Component({
  selector: 'app-loginpage',
  imports: [],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css'
})
export class LoginpageComponent {

  num = 5;
  selectedPanel: string = 'overview'; // 預設帳戶總覽

  selectPanel(panel: string) {
    this.selectedPanel = panel;
  }

}
