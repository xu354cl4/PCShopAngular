import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from './gamehome/gamehome.component';
import { AdsBackComponent } from "./ads-back/ads-back.component";
import { FaqsBackComponent } from './faqs-back/faqs-back.component';

@Component({
  selector: 'app-root',

  standalone: true,
  imports: [RouterOutlet,
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MatDialogModule,
    AdsBackComponent,
    FaqsBackComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PcShop';
  isGameHomeOpened = false;
  showFloating = true;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.showFloating = !sessionStorage.getItem('gameFloatingClosed');
    //讀取到gameFloatingClosed有值後，就不顯示浮動按鈕
  }

  closeFloating() {
    this.showFloating = false;
    sessionStorage.setItem('gameFloatingClosed', '1');
    //gameFloatingClosed賦予一個值代表關閉過
  }

  openGameHome() {
    //  一點就先藏按鈕
    this.isGameHomeOpened = true;
    this.showFloating = false;

    const dialogRef = this.dialog.open(GamehomeComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '100vw',
      maxHeight: '100vh'
    });

    //  Gamehome 關閉 → 按鈕回來
    dialogRef.afterClosed().subscribe(() => {
      this.isGameHomeOpened = false;
      this.showFloating = true;
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
