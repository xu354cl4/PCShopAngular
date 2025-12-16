import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UpperCasePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GameService, SubmitGameScoreDto } from '../Services/game.service';


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
    @Inject(MAT_DIALOG_DATA) public data: { game: string },  //只有在寫了@Inject(MAT_DIALOG_DATA)後才會接收到資料
    private dialogRef: MatDialogRef<GameDialogComponent>,
    private sanitizer: DomSanitizer,
    private gameService: GameService
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

  receiveMessage = (event: MessageEvent) => {
    if (!event.data || event.data.type !== 'gameScore') return;

    // ⭐ 一定要先宣告
    const gameId = Number(event.data.gameId);
    const score = Number(event.data.score);

    if (!gameId || gameId <= 0) {
      console.warn('Invalid gameId', event.data);
      return;
    }

    const payload = {
      gameId: gameId,
      score: score
    };

    this.gameService.submitScore(payload).subscribe();
  };


  close() {
    this.dialogRef.close();
  }
}
