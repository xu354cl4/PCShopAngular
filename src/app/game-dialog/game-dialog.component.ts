import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-dialog',
  standalone: true,
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.css'],
})
export class GameDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { game: string },
    private dialogRef: MatDialogRef<GameDialogComponent>
  ) {
    window.addEventListener("message", this.receiveMessage);
  }

  ngOnDestroy() {
    window.removeEventListener("message", this.receiveMessage);
  }

  receiveMessage = (event: any) => {
    if (event.data?.type === 'gameScore') {
      console.log("收到遊戲分數:", event.data.score);

      // TODO: 你可以加入 API，把分數送到資料庫
    }
  };

  close() {
    this.dialogRef.close();
  }
}
