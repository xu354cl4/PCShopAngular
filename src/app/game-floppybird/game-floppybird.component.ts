import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-floppybird',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-floppybird.component.html',
})
export class GameFloppybirdComponent {
  constructor(private dialogRef: MatDialogRef<GameFloppybirdComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
