import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  private reviewAddedSubject = new BehaviorSubject<any>(null);
  reviewAdded$ = this.reviewAddedSubject.asObservable();

  constructor(private http: HttpClient) {}

  setGameReview(
    gameId: number,
    review: string,
    gameName: string,
    backgroundImage?: string,
    rating?: number
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${gameId}`, {
      text: review,
      rating,
      name: gameName,
      backgroundImage
    }).pipe(
      tap(newReview => this.reviewAddedSubject.next(newReview))
    );
  }

  getGameReviews(gameId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/game/${gameId}`);
  }

  getReviewsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
}