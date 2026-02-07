import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IgdbApiService {
  private readonly apiUrl = 'https://api.igdb.com/v4';
  private accessToken: string;
  private tokenExpiry: number;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('IGDB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('IGDB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'IGDB credentials not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.post(
          `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
        )
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo token de IGDB',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async query(endpoint: string, body: string): Promise<any> {
    const token = await this.getAccessToken();
    const clientId = this.configService.get<string>('IGDB_CLIENT_ID');

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/${endpoint}`, body, {
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      );

      return response.data;
    } catch (error) {
      console.error('IGDB API Error:', error.response?.data || error.message);
      throw new HttpException(
        'Error consultando IGDB',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async searchGames(query: string, limit = 20): Promise<any> {
    const body = `
      search "${query}";
      fields name, summary, rating, rating_count, first_release_date,
             aggregated_rating, cover.*, platforms.*, genres.*, 
             screenshots.*, involved_companies.*, age_ratings.*;
      limit ${limit};
    `;

    return this.query('games', body);
  }

  async getGameById(id: number): Promise<any> {
    const body = `
      fields name, summary, storyline, rating, rating_count, 
             first_release_date, aggregated_rating, 
             cover.*, platforms.*, genres.*, screenshots.*, 
             involved_companies.*, age_ratings.*;
      where id = ${id};
    `;

    const results = await this.query('games', body);
    return results[0];
  }

  async getTopGames(limit = 250, minRatingCount = 50): Promise<any> {
    const body = `
      fields name, summary, rating, rating_count, first_release_date,
             aggregated_rating, cover.*, platforms.*, genres.*, screenshots.*;
      where rating_count >= ${minRatingCount} & rating != null;
      sort rating desc;
      limit ${limit};
    `;

    return this.query('games', body);
  }

  async getIndieGames(limit = 100, minRatingCount = 50): Promise<any> {
    const body = `
      fields name, summary, rating, rating_count, first_release_date,
             cover.*, platforms.*, genres.*, screenshots.*;
      where genres = (32) & rating_count >= ${minRatingCount} & rating != null;
      sort rating desc;
      limit ${limit};
    `;

    return this.query('games', body);
  }

  async getTrendingGames(limit = 24): Promise<any> {
    const today = Math.floor(Date.now() / 1000);
    const lastMonth = today - (30 * 24 * 60 * 60);

    const body = `
      fields name, summary, rating, rating_count, first_release_date,
             hypes, cover.*, platforms.*, genres.*, screenshots.*;
      where first_release_date >= ${lastMonth} & first_release_date <= ${today};
      sort hypes desc;
      limit ${limit};
    `;

    return this.query('games', body);
  }
}