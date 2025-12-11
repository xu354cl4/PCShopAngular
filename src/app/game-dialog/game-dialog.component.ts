import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { UpperCasePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game-dialog',
  standalone: true,
  imports: [
    UpperCasePipe,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.css']
})
export class GameDialogComponent {

  safeUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { game: string },
    private dialogRef: MatDialogRef<GameDialogComponent>,
    private sanitizer: DomSanitizer
  ) {

    // 安全 iframe 網址
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `/games/${data.game}/index.html`
    );

    // 接收遊戲訊息
    window.addEventListener("message", this.receiveMessage);
  }

  ngOnDestroy() {
    window.removeEventListener("message", this.receiveMessage);
  }

  receiveMessage = (event: any) => {
    if (event.data?.type === 'gameScore') {
      console.log("🎮 收到遊戲分數:", event.data.score);

      // 你可以在這裡呼叫 API
      // this.gameService.saveScore(data.game, event.data.score).subscribe(...)
    }
  };

  close() {
    this.dialogRef.close();
  }
}
