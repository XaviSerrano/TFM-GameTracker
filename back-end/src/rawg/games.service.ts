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
}