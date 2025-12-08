import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-dialog.component.html'
})
export class GameDialogComponent {
  constructor(private dialogRef: MatDialogRef<GameDialogComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
