import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';
import { GameFloppybirdComponent } from '../game-floppybird/game-floppybird.component';


@Component({
  selector: 'app-gamehome',
  standalone: true,
  templateUrl: './gamehome.component.html'

})
export class GamehomeComponent {
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<GamehomeComponent>   // ← 注入自己
  ) { }

  openGame() {
    this.dialog.open(GameDialogComponent, {
      width: '500px',
      height: '800px'
    });
  }
  openGame2() {
    this.dialog.open(GameFloppybirdComponent, {
      width: '500px',
      height: '800px'
    });
  }
  closeGame() {
    this.dialogRef.close();   // <= 使用 dialogRef 關閉
  }
}
