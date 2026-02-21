import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGame } from './user-game.entity';
import { GameService } from '../game/game.service';
import { User } from '../user/user.entity';

export type GameStatus = 'Playing' | 'Played' | 'Completed' | 'Abandoned';

@Injectable()
export class UserGameService {

  constructor(
    @InjectRepository(UserGame)
    private repo: Repository<UserGame>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly gameService: GameService,
  ) {}

  private async getUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async findUserGame(userId: number, gameId: number) {
    return this.repo.findOne({
      where: { user: { id: userId }, game: { id: gameId } },
      relations: ['game'],
    });
  }

  // 🎮 SET STATUS
  async setStatus(
    userId: number,
    gameId: number,
    status: GameStatus,
    gameData?: {
      name?: string;
      backgroundImage?: string;
      released?: string;
      rating?: number; // 👈 rating IGDB
    }
  ) {

    const user = await this.getUser(userId);

    // 👇 Guardamos rating IGDB en Game
    const game = await this.gameService.findOrCreate({
      id: gameId,
      name: gameData?.name,
      backgroundImage: gameData?.backgroundImage,
      released: gameData?.released,
      rating: gameData?.rating ?? null,
    });

    let userGame = await this.findUserGame(userId, gameId);

    if (!userGame) {
      userGame = this.repo.create({
        user,
        game,
        status,
        gameName: gameData?.name,
        backgroundImage: gameData?.backgroundImage,
      });
    } else {
      userGame.status = status;
      if (gameData?.name) userGame.gameName = gameData.name;
    }

    return this.repo.save(userGame);
  }

  // ⭐ RATING DEL USUARIO
  async setRating(userId: number, gameId: number, rating: number) {

    const user = await this.getUser(userId);

    let userGame = await this.findUserGame(userId, gameId);

    if (!userGame) {
      const game = await this.gameService.findOrCreate({ id: gameId });
      userGame = this.repo.create({
        user,
        game,
        status: 'Playing',
        rating,
      });
    } else {
      userGame.rating = rating;
    }

    return this.repo.save(userGame);
  }

  async setPlaytime(userId: number, gameId: number, playtime: number) {

    const user = await this.getUser(userId);

    let userGame = await this.findUserGame(userId, gameId);

    if (!userGame) {
      const game = await this.gameService.findOrCreate({ id: gameId });
      userGame = this.repo.create({
        user,
        game,
        status: 'Playing',
        playtime,
      });
    } else {
      userGame.playtime = playtime;
    }

    return this.repo.save(userGame);
  }

  // 📚 LISTAS
  async getUserGamesByStatus(userId: number, status: GameStatus) {
    return this.repo.find({
      where: { user: { id: userId }, status },
      relations: ['game'],
      order: { updatedAt: 'DESC' },
    });
  }

  // 🔍 STATUS DE UN JUEGO
  async getGameStatus(userId: number, gameId: number) {

    const userGame = await this.findUserGame(userId, gameId);

    return {
      status: userGame?.status ?? null,
      userRating: userGame?.rating ?? null,
      playtime: userGame?.playtime ?? 0,
    };
  }
}