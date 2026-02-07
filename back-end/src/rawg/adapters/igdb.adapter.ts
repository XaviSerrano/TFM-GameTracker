import { Injectable } from '@nestjs/common';
import { NormalizedGame, NormalizedGameList } from '../interfaces/game.interface';

@Injectable()
export class IgdbAdapter {
  normalizeGame(igdbGame: any): NormalizedGame {
    if (!igdbGame) return null;

    return {
      id: igdbGame.id,
      name: igdbGame.name,
      description: igdbGame.summary || igdbGame.storyline,
      backgroundImage: this.normalizeImageUrl(igdbGame.cover?.url),
      rating: igdbGame.rating ? igdbGame.rating / 20 : undefined,
      ratingsCount: igdbGame.rating_count,
      released: igdbGame.first_release_date 
        ? new Date(igdbGame.first_release_date * 1000).toISOString().split('T')[0]
        : undefined,
      platforms: igdbGame.platforms?.map((p: any) => p.name).filter(Boolean) || [],
      genres: igdbGame.genres?.map((g: any) => g.name).filter(Boolean) || [],
      developers: igdbGame.involved_companies
        ?.filter((ic: any) => ic.developer && ic.company)
        .map((ic: any) => ic.company.name)
        .filter(Boolean) || [],
      publishers: igdbGame.involved_companies
        ?.filter((ic: any) => ic.publisher && ic.company)
        .map((ic: any) => ic.company.name)
        .filter(Boolean) || [],
      esrbRating: igdbGame.age_ratings
        ?.find((ar: any) => ar.category === 1)?.rating_label,
      metacritic: igdbGame.aggregated_rating,
      playtime: undefined,
      screenshots: igdbGame.screenshots
        ?.map((s: any) => this.normalizeImageUrl(s.url))
        .filter(Boolean) || [],
    };
  }

  private normalizeImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;

    // Si ya tiene protocolo, solo cambia el tamaño
    if (url.startsWith('http')) {
      return url.replace('t_thumb', 't_1080p');
    }

    // Si viene sin protocolo (//images.igdb.com/...)
    return `https:${url.replace('t_thumb', 't_1080p')}`;
  }

  normalizeGameList(igdbGames: any[], total?: number): NormalizedGameList {
    if (!igdbGames || !Array.isArray(igdbGames)) {
      return { results: [], count: 0 };
    }

    return {
      results: igdbGames
        .map(game => this.normalizeGame(game))
        .filter(Boolean),
      count: total || igdbGames.length,
    };
  }
}