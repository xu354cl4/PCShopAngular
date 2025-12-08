import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterOutlet } from "../../../node_modules/@angular/router/router_module.d-Bx9ArA6K";
import { MatDialog } from '@angular/material/dialog';
import { GamehomeComponent } from '../gamehome/gamehome.component';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(private dialog: MatDialog) { }

  openGameHome() {
    this.dialog.open(GamehomeComponent, {
      width: '80vw',       // 視窗寬度
      height: '80vh',      // 視窗高度
      maxWidth: '100vw',    // 移除 Material Dialog 預設最大寬度
      maxHeight: '100vh',   // 移除 Material Dialog 預設最大高度
    });
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
