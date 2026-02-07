import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RawgService {
  // private apiUrl = 'https://api.rawg.io/api';
  // private apiKey = '98cf656e3b054483a3d2edafaa6cae58';

  private apiUrl = `${environment.apiUrl}/rawg`;


  constructor(private http: HttpClient) {}

  // getTrendingGames(): Observable<any> {
  //   const today = new Date();
  //   const lastMonth = new Date();
  //   lastMonth.setMonth(today.getMonth() - 1);

  //   const from = lastMonth.toISOString().split('T')[0];
  //   const to = today.toISOString().split('T')[0];

  //   const url = `${this.apiUrl}/games?key=${this.apiKey}&dates=${from},${to}&ordering=-added&page_size=24`;
  //   return this.http.get(url);
  // }

  getTrendingGames(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trending`);
  }

  // TOP 250 GAMES
  // getTop250Games(minRatingsCount: number = 50): Observable<any> {
  //   const pageSize = 40;
  //   const totalPages = 10;
  //   const requests: Observable<any>[] = [];

  //   for (let page = 1; page <= totalPages; page++) {
  //     const url = `${this.apiUrl}/games?key=${this.apiKey}&ordering=-rating&page_size=${pageSize}&page=${page}`;
  //     requests.push(this.http.get(url));
  //   }

  //   return combineLatest(requests).pipe(
  //     map((responses: any[]) => {
  //       const allGames = responses.flatMap((r: any) => r.results);
        
  //       const filteredGames = allGames.filter(g => g.ratings_count >= minRatingsCount);

  //       filteredGames.sort((a, b) => b.rating - a.rating);

  //       return { results: filteredGames.slice(0, 250) };
  //     })
  //   );
  // }

  getTop250Games(): Observable<any> {
    return this.http.get(`${this.apiUrl}/top`);
  }

  // TOP INDIE GAMES
  // getTopIndieGames(minRatingsCount: number = 50): Observable<any> {
  //   const pageSize = 40;
  //   const totalPages = 5;
  //   const requests: Observable<any>[] = [];

  //   for (let page = 1; page <= totalPages; page++) {
  //     const url = `${this.apiUrl}/games?key=${this.apiKey}&genres=indie&ordering=-rating&page_size=${pageSize}&page=${page}`;
  //     requests.push(this.http.get(url));
  //   }

  //   return combineLatest(requests).pipe(
  //     map((responses: any[]) => {
  //       const allGames = responses.flatMap((r: any) => r.results);

  //       // Filtrar por número mínimo de valoraciones
  //       const filteredGames = allGames.filter(g => g.ratings_count >= minRatingsCount);

  //       // Ordenar por rating descendente
  //       filteredGames.sort((a, b) => b.rating - a.rating);

  //       // 100 mejores
  //       return { results: filteredGames.slice(0, 100) };
  //     })
  //   );
  // }

  getTopIndieGames(): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-indie`);
  }

  // getGamesByName(query: string): Observable<any> {
  //   const url = `${this.apiUrl}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
  //   return this.http.get(url);
  // }

  getGamesByName(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  // getGameById(id: number): Observable<any> {
  //   const url = `${this.apiUrl}/games/${id}?key=${this.apiKey}`;
  //   return this.http.get(url);
  // }
  getGameById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
