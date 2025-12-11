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

  constructor(private dialog: MatDialog) { }

  openGameHome() {
    this.dialog.open(GamehomeComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
