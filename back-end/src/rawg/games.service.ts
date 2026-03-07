// src/modules/igdb/games.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IgdbApiService } from './services/igdb-api.service';
import { IgdbAdapter } from './adapters/igdb.adapter';
import { NormalizedGame, NormalizedGameList } from './interfaces/game.interface';

@Injectable()
export class GamesService {
  constructor(
    private readonly igdbApi: IgdbApiService,
    private readonly igdbAdapter: IgdbAdapter,
  ) {}

  async getTrendingGames(): Promise<NormalizedGameList> {
    const rawData = await this.igdbApi.getTrendingGames(24);
    return this.igdbAdapter.normalizeGameList(rawData);
  }

  async getTop250Games(): Promise<NormalizedGameList> {
    const rawData = await this.igdbApi.getTopGames(250, 50);
    return this.igdbAdapter.normalizeGameList(rawData);
  }

  async getTopIndieGames(): Promise<NormalizedGameList> {
    const rawData = await this.igdbApi.getIndieGames(100, 50);
    return this.igdbAdapter.normalizeGameList(rawData);
  }

  async getGamesByName(query: string): Promise<NormalizedGameList> {
    const rawData = await this.igdbApi.searchGames(query, 20);
    return this.igdbAdapter.normalizeGameList(rawData);
  }

  async getGameById(id: number): Promise<NormalizedGame> {
    const rawData = await this.igdbApi.getGameById(id);
    return this.igdbAdapter.normalizeGame(rawData);
  }

  // ✅ NUEVO MÉTODO - Time to beat
  async getTimeToBeat(gameId: number): Promise<any> {
    try {
      const timeToBeat = await this.igdbApi.getTimeToBeat(gameId);
      return timeToBeat || {};
    } catch (error) {
      console.error(`Error in GamesService.getTimeToBeat for game ${gameId}:`, error);
      return {}; // Importante: devolver objeto vacío, no lanzar error
    }
  }

  
  async getPlatformVersionsByPlatform(gameId: number): Promise<any> {
    const body = `
      fields date, region, human, platform.name;
      where game = ${gameId};
      sort date asc;
      limit 20;
    `;

    return this.igdbApi.query('release_dates', body);
  }

  async getSimilarGames(gameId: number): Promise<NormalizedGameList> {
    try {
      const rawSimilar = await this.igdbApi.getSimilarGames(gameId);

      // Si IGDB devuelve menos de 4, complementa con juegos del mismo género
      if (rawSimilar.length < 4) {
        const rawGame = await this.igdbApi.getGameById(gameId);
        const genreIds = rawGame?.genres?.map((g: any) => g.id) || [];

        if (genreIds.length > 0) {
          const body = `
            fields name, summary, rating, rating_count, first_release_date,
                  cover.*, platforms.*, genres.*;
            where genres = (${genreIds.join(',')}) 
                  & id != ${gameId} 
                  & rating != null 
                  & rating_count >= 20;
            sort rating desc;
            limit 10;
          `;
          const rawByGenre = await this.igdbApi.query('games', body);
          const combined = [...rawSimilar, ...rawByGenre]
            .filter((g, i, arr) => arr.findIndex(x => x.id === g.id) === i) // deduplica
            .slice(0, 10);
          return this.igdbAdapter.normalizeGameList(combined);
        }
      }

      return this.igdbAdapter.normalizeGameList(rawSimilar);
    } catch (error) {
      console.error(`Error getting similar games for ${gameId}:`, error);
      return { results: [], count: 0 };
    }
  }
}