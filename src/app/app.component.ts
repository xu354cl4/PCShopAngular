import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from './gamehome/gamehome.component';
import { AdSlotComponent } from "./ad-slot/ad-slot.component";
import { AdsVisibilityService } from './Services/ads-visibility.service';

@Component({
  selector: 'app-root',

  standalone: true,
  imports: [RouterOutlet,
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MatDialogModule,
    AdSlotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PcShop';
  isGameHomeOpened = false;
  showFloating = false;

  constructor(private dialog: MatDialog, public adsVis: AdsVisibilityService) { }

  ngOnInit(): void {
    // this.showFloating = !sessionStorage.getItem('gameFloatingClosed');
    //讀取到gameFloatingClosed有值後，就不顯示浮動按鈕
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showFloating = true;
    }, 500); // 0.5 秒後出現
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

    this.adsVis.setGameHomeOpen(true); // ✅ 開啟時先隱藏右浮動

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
      this.adsVis.setGameHomeOpen(false); // ✅ 關閉時再恢復（若使用者按叉叉關掉則仍不會出現）
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
