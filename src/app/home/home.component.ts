import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private dialog: MatDialog) { }

  openGame() {
    this.dialog.open(GameDialogComponent, {
      width: '500px',
      height: '600px'
    });
  }
}
