import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameDialogComponent } from '../game-dialog/game-dialog.component';
import { Overlay } from '@angular/cdk/overlay';


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
    private dialogRef: MatDialogRef<GamehomeComponent>,   // ← 注入自己
    private overlay: Overlay
  ) { }

  openGame(gameName: string) {
    this.dialog.open(GameDialogComponent, {  //將data: { game: gameName }傳給GameDialogComponent
      width: '90vw',
      maxWidth: '100vw',

      // ⭐ 關鍵：不給 height
      // ⭐ 讓 dialog 自己撐滿 viewport
      panelClass: 'game-dialog',

      data: { game: gameName },

      // ⭐ 關鍵：鎖住所有背景 scroll（包含第一層 dialog）
      scrollStrategy: this.overlay.scrollStrategies.block(),

      autoFocus: false,
      restoreFocus: false
    });
  }

  closeGame() {
    this.dialogRef.close();   // <= 使用 dialogRef 關閉
  }
}
