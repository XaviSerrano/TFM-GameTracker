import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './reviews.entity';
import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';
import { GameService } from '../game/game.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private readonly gameService: GameService,
  ) {}

  // 📝 Crear review
  async create(
    userId: number,
    gameId: number,
    text: string,
    gameName?: string,
    backgroundImage?: string,
    rating?: number,
  ) {
    if (!text?.trim()) throw new Error('Review cannot be empty');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');


    const game = await this.gameService.findOrCreate({
      id: gameId,
      name: gameName,
      backgroundImage,
    });

    const review = this.reviewRepo.create({
      user,
      game,
      review: text,
      rating,
    });

    return this.reviewRepo.save(review);
  }

  // 🌍 Reviews de un juego (público)
  async getByGame(gameId: number) {
    const reviews = await this.reviewRepo.find({
      where: { game: { id: gameId } },
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map(r => ({
      id: r.id,
      userId: r.user.id,
      username: r.user.username,
      displayName: r.user.displayName || r.user.username,
      profileImage: r.user.profileImage || null,
      review: r.review,
      rating: r.rating,
      createdAt: r.createdAt,
      gameId: r.game.id,
      gameName: r.game.name,
      backgroundImage: r.game.backgroundImage,
    }));
  }

  // 👤 Reviews de un usuario (público)
  async getByUser(userId: number) {
    const reviews = await this.reviewRepo.find({
      where: { user: { id: userId } },
      relations: ['game'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map(r => ({
      id: r.id,
      gameId: r.game.id,
      gameName: r.game.name,
      backgroundImage: r.game.backgroundImage,
      review: r.review,
      rating: r.rating,
      createdAt: r.createdAt,
    }));
  }

  // 🔐 Editar review
  async update(userId: number, reviewId: number, text: string, rating?: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId) throw new ForbiddenException('Not your review');

    review.review = text ?? review.review;
    review.rating = rating ?? review.rating;

    return this.reviewRepo.save(review);
  }

  // 🗑️ Borrar review
  async remove(userId: number, reviewId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId) throw new ForbiddenException('Not your review');

    await this.reviewRepo.delete(reviewId);
    return { deleted: true };
  }
}
