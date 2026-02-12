import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGame } from './user-game.entity';
import { GameService } from '../game/game.service';
import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';

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

  private async getGame(gameId: number) {
    return this.gameService.findOrCreate({ id: gameId });
  }

  private async findUserGame(userId: number, gameId: number) {
    return this.repo.findOne({
      where: { user: { id: userId }, game: { id: gameId } },
      relations: ['user', 'game'],
    });
  }

  // 🎮 STATUS
  async setStatus(userId: number, gameId: number, status: GameStatus) {
    const user = await this.getUser(userId);
    const game = await this.getGame(gameId);

    let userGame = await this.findUserGame(userId, game.id);

    if (!userGame) {
      userGame = this.repo.create({ user, game, status });
    } else {
      userGame.status = status;
    }

    return this.repo.save(userGame);
  }

  // ⭐ RATING
  async setRating(userId: number, gameId: number, rating: number) {
    const user = await this.getUser(userId);
    const game = await this.getGame(gameId);

    let userGame = await this.findUserGame(userId, game.id);

    if (!userGame) {
      userGame = this.repo.create({ user, game, status: 'Playing', rating });
    } else {
      userGame.rating = rating;
    }

    return this.repo.save(userGame);
  }

  // ⏱️ PLAYTIME
  async setPlaytime(userId: number, gameId: number, playtime: number) {
    const user = await this.getUser(userId);
    const game = await this.getGame(gameId);

    let userGame = await this.findUserGame(userId, game.id);

    if (!userGame) {
      userGame = this.repo.create({ user, game, status: 'Playing', playtime });
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

  // 📊 STATUS/RATING/PLAYTIME de un juego concreto del usuario
  async getGameStatus(userId: number, gameId: number) {
    const userGame = await this.repo.findOne({
      where: { user: { id: userId }, game: { id: gameId } },
    });

    return {
      status: userGame?.status || null,
      rating: userGame?.rating ?? null,
      playtime: userGame?.playtime ?? 0,
    };
  }

}