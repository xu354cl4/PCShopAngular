import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';


@Component({
  selector: 'app-gamehome',
  standalone: true,
  templateUrl: './gamehome.component.html',
  styleUrls: ['./gamehome.component.css']
})
export class GamehomeComponent {
  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<GamehomeComponent>   // ← 注入自己
  ) { }

  openGame(gameName: string) {
    this.dialog.open(GameDialogComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { game: gameName }
    });
  }

  closeGame() {
    this.dialogRef.close();   // <= 使用 dialogRef 關閉
  }
}
