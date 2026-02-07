import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RawgAdapter } from './adapters/rawg.adapter';
import { NormalizedGame, NormalizedGameList } from './interfaces/game.interface';

@Injectable()
export class RawgService {
  private readonly apiUrl = 'https://api.rawg.io/api';
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly rawgAdapter: RawgAdapter, // ← Inyecta el adaptador
  ) {
    this.apiKey = this.configService.get<string>('RAWG_API_KEY');
  }

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

  async getTrendingGames(): Promise<NormalizedGameList> {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const from = lastMonth.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const url = `${this.apiUrl}/games?key=${this.apiKey}&dates=${from},${to}&ordering=-added&page_size=24`;
    const rawData = await this.fetch(url);
    
    return this.rawgAdapter.normalizeGameList(rawData); // ← Normaliza
  }

  async getTop250Games(minRatingsCount = 50): Promise<NormalizedGameList> {
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

    // Normaliza la respuesta
    return this.rawgAdapter.normalizeGameList({ results: filteredGames });
  }

  async getTopIndieGames(minRatingsCount = 50): Promise<NormalizedGameList> {
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

    return this.rawgAdapter.normalizeGameList({ results: filteredGames });
  }

  async getGamesByName(query: string): Promise<NormalizedGameList> {
    const url = `${this.apiUrl}/games?key=${this.apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
    const rawData = await this.fetch(url);
    
    return this.rawgAdapter.normalizeGameList(rawData);
  }

  async getGameById(id: number): Promise<NormalizedGame> {
    const url = `${this.apiUrl}/games/${id}?key=${this.apiKey}`;
    const rawData = await this.fetch(url);
    
    return this.rawgAdapter.normalizeGame(rawData); // ← Normaliza
  }
}