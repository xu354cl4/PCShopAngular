import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginpageComponent } from "./loginpage/loginpage.component";
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from './gamehome/gamehome.component';
@Component({
  selector: 'app-root',

  standalone: true,
  imports: [RouterOutlet,
    LoginpageComponent,
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PcShop';
  isGameHomeOpened = false;

  constructor(private dialog: MatDialog) { }

  openGameHome() {
    //  一點就先藏按鈕
    this.isGameHomeOpened = true;

    const dialogRef = this.dialog.open(GamehomeComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '100vw',
      maxHeight: '100vh'
    });

    //  Gamehome 關閉 → 按鈕回來
    dialogRef.afterClosed().subscribe(() => {
      this.isGameHomeOpened = false;
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
