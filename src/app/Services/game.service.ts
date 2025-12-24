import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubmitGameScoreDto {
  gameId: number;
  score: number;
  gameCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private apiUrl = '/api/game';

  constructor(private http: HttpClient) { }

  submitScore(dto: SubmitGameScoreDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit-score`, dto);
  }
}
