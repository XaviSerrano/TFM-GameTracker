import { Injectable } from '@nestjs/common';
import { NormalizedGame, NormalizedGameList } from '../interfaces/game.interface';

@Injectable()
export class RawgAdapter {
  /**
   * Normaliza un juego individual de RAWG
   */
  normalizeGame(rawgGame: any): NormalizedGame {
    return {
      id: rawgGame.id,
      name: rawgGame.name,
      description: rawgGame.description_raw || rawgGame.description,
      backgroundImage: rawgGame.background_image,
      rating: rawgGame.rating,
      ratingsCount: rawgGame.ratings_count,
      released: rawgGame.released,
      platforms: rawgGame.platforms?.map((p: any) => p.platform?.name).filter(Boolean) || [],
      genres: rawgGame.genres?.map((g: any) => g.name) || [],
      developers: rawgGame.developers?.map((d: any) => d.name) || [],
      publishers: rawgGame.publishers?.map((p: any) => p.name) || [],
      esrbRating: rawgGame.esrb_rating?.name,
      metacritic: rawgGame.metacritic,
      playtime: rawgGame.playtime,
      screenshots: rawgGame.short_screenshots?.map((s: any) => s.image) || [],
    };
  }

  /**
   * Normaliza una lista de juegos
   */
  normalizeGameList(rawgResponse: any): NormalizedGameList {
    return {
      results: rawgResponse.results?.map((game: any) => this.normalizeGame(game)) || [],
      count: rawgResponse.count,
      next: rawgResponse.next,
      previous: rawgResponse.previous,
    };
  }
}