import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GamehomeComponent } from '../gamehome/gamehome.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private dialog: MatDialog) { }

  openGameHome() {
    this.dialog.open(GamehomeComponent, {
      width: '80vw',       // 視窗寬度
      height: '80vh',      // 視窗高度
      maxWidth: '100vw',    // 移除 Material Dialog 預設最大寬度
      maxHeight: '100vh',   // 移除 Material Dialog 預設最大高度
    });
  }
}
