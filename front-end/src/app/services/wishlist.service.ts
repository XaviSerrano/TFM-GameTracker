import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface WishlistItem {
  id: number;
  gameId: number;
  gameName: string;
  backgroundImage?: string;
  rating?: number;
  released?: string;
  genres?: string[];
  platforms?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(this.apiUrl);
  }

  addToWishlist(game: { 
    gameId: number; 
    gameName: string; 
    backgroundImage?: string; 
    rating?: number;
    released?: string; 
    genres?: string[]; 
    platforms?: string[] 
  }): Observable<WishlistItem> {
    const { gameId, ...body } = game;
    return this.http.post<WishlistItem>(`${this.apiUrl}/${gameId}`, body);
  }

  removeFromWishlist(gameId: number): Observable<any> {
    console.log('[WishlistService] DELETE gameId:', gameId);
    return this.http.delete(`${this.apiUrl}/${gameId}`);
  }

  isInWishlist(gameId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${gameId}`);
  }

  getWishlistByUser(userId: number): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/user/${userId}`);
  }

}
