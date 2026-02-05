import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserGameService {
private apiUrl = `${environment.apiUrl}/user-games`;

private reviewAddedSubject = new BehaviorSubject<any>(null);
reviewAdded$ = this.reviewAddedSubject.asObservable();

constructor(private http: HttpClient) {}

setGameStatus(
gameId: number,
status: string,
name?: string,
backgroundImage?: string,
released?: string,
rating?: number
): Observable<any> {
return this.http.post(`${this.apiUrl}/status`, {
gameId,
status,
name,
backgroundImage,
released,
rating
});
}

getGamesByStatus(status: string): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/${status}`);
}

getGameStatus(gameId: number): Observable<{ status: string; rating: number | null; playtime: number; review?: string }> {
return this.http.get<{ status: string; rating: number | null; playtime: number; review?: string }>(
`${this.apiUrl}/status/${gameId}`
);
}

setGameRating(gameId: number, rating: number): Observable<any> {
return this.http.post(`${this.apiUrl}/rating`, { gameId, rating });
}

setGamePlaytime(gameId: number, playtime: number): Observable<any> {
return this.http.post(`${this.apiUrl}/playtime`, { gameId, playtime });
}

setGameReview(
gameId: number,
review: string,
name?: string,
backgroundImage?: string,
released?: string,
rating?: number
): Observable<any> {
return this.http.post<any>(`${this.apiUrl}/review`, {
gameId,
review,
name,
backgroundImage,
released,
rating
}).pipe(
tap(newReview => this.reviewAddedSubject.next(newReview))
);
}

/** Público */
getGameReviews(gameId: number): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/${gameId}/reviews`);
}

getMyReviews(): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/user-reviews`);
}

getReviewsByUserId(userId: number): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/reviews`);
}

getUserGamesByStatus(userId: number, status: string): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/status/${status}`);
}
}
