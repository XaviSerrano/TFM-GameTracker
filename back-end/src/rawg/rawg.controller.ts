// src/modules/igdb/igdb.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('igdb')
export class IgdbController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('trending')
  getTrending() {
    return this.gamesService.getTrendingGames();
  }

  @Get('top')
  getTop250() {
    return this.gamesService.getTop250Games();
  }

  @Get('top-indie')
  getTopIndie() {
    return this.gamesService.getTopIndieGames();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.gamesService.getGamesByName(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.gamesService.getGameById(Number(id));
  }

  // ✅ ENDPOINT CORREGIDO - Usa GamesService, NO igdbApiService directamente
  @Get(':id/time-to-beat')
  async getTimeToBeat(@Param('id') id: string) {
    try {
      const gameId = parseInt(id, 10);
      const timeToBeat = await this.gamesService.getTimeToBeat(gameId);
      return timeToBeat || {};
    } catch (error) {
      console.error(`Error fetching time-to-beat for game ${id}:`, error);
      return {}; // Siempre devolver objeto vacío, nunca 404
    }
  }
}