import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterOutlet } from "@angular/router";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from '../gamehome/gamehome.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatDialogModule   // ← 很重要！一定要加
  ]
})
export class LayoutComponent {
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
