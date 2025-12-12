import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';

// MatDialog = 開啟 / 建立 Dialog 的工廠（外部用）
// MatDialogRef = 已經被開啟的 Dialog 的控制器（內部用）

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
    this.dialog.open(GameDialogComponent, {  //將data: { game: gameName }傳給GameDialogComponent
      width: '90vw',
      height: '90vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { game: gameName }
    });
  }

  closeGame() {
    this.dialogRef.close();   // <= 使用 dialogRef 關閉
  }
}
