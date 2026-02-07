import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NormalizedGame {
  id: number;
  name: string;
  description?: string;
  backgroundImage?: string;
  rating?: number;
  ratingsCount?: number;
  released?: string;
  platforms?: string[];
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  esrbRating?: string;
  metacritic?: number;
  playtime?: number;
  screenshots?: string[];
}

export interface NormalizedGameList {
  results: NormalizedGame[];
  count?: number;
  next?: string;
  previous?: string;
}

@Injectable({ providedIn: 'root' })
export class RawgService {
  private apiUrl = `${environment.apiUrl}/rawg`;

  constructor(private http: HttpClient) {}

  getTrendingGames(): Observable<NormalizedGameList> {
    return this.http.get<NormalizedGameList>(`${this.apiUrl}/trending`);
  }

  getTop250Games(): Observable<NormalizedGameList> {
    return this.http.get<NormalizedGameList>(`${this.apiUrl}/top`);
  }

  getTopIndieGames(): Observable<NormalizedGameList> {
    return this.http.get<NormalizedGameList>(`${this.apiUrl}/top-indie`);
  }

  getGamesByName(query: string): Observable<NormalizedGameList> {
    return this.http.get<NormalizedGameList>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  getGameById(id: number): Observable<NormalizedGame> {
    return this.http.get<NormalizedGame>(`${this.apiUrl}/${id}`);
  }
}

