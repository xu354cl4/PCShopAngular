import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GamehomeComponent } from './gamehome/gamehome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MatDialogModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
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
