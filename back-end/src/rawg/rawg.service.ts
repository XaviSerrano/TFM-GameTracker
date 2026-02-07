import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RawgService {
  private readonly apiUrl = 'https://api.rawg.io/api';
  private readonly apiKey = process.env.RAWG_API_KEY;


  constructor(private readonly http: HttpService) {}


  private async fetch(url: string) {
    try {
      const response = await firstValueFrom(this.http.get(url));
        return response.data;
        } catch (error) {
      throw new HttpException(
        'Error al consultar RAWG',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getTrendingGames() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);


    const from = lastMonth.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];


    const url = `${this.apiUrl}/games?key=${this.apiKey}&dates=${from},${to}&ordering=-added&page_size=24`;

    return this.fetch(url);
  }


  async getTop250Games(minRatingsCount = 50) {
    const pageSize = 40;
    const totalPages = 10;


    const requests = [];


    for (let page = 1; page <= totalPages; page++) {
    const url = `${this.apiUrl}/games?key=${this.apiKey}&ordering=-rating&page_size=${pageSize}&page=${page}`;
    requests.push(this.fetch(url));
    }


    const responses = await Promise.all(requests);


    const allGames = responses.flatMap((r: any) => r.results);


    const filteredGames = allGames
    .filter((g) => g.ratings_count >= minRatingsCount)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 250);


    return { results: filteredGames };
  }


  async getTopIndieGames(minRatingsCount = 50) {
    const pageSize = 40;
    const totalPages = 5;


    const requests = [];


    for (let page = 1; page <= totalPages; page++) {
    const url = `${this.apiUrl}/games?key=${this.apiKey}&genres=indie&ordering=-rating&page_size=${pageSize}&page=${page}`;
    requests.push(this.fetch(url));
    }

    const responses = await Promise.all(requests);

    const allGames = responses.flatMap((r: any) => r.results);

    const filteredGames = allGames
    .filter((g) => g.ratings_count >= minRatingsCount)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 100);


    return { results: filteredGames };
  }

  async getGamesByName(query: string) {
    const url = `${this.apiUrl}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
    return this.fetch(url);
  }

  async getGameById(id: number) {
    const url = `${this.apiUrl}/games/${id}?key=${this.apiKey}`;
    return this.fetch(url);
  }
}
