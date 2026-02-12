import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('game/:gameId')
  getByGame(@Param('gameId') gameId: number) {
    return this.reviewsService.getByGame(+gameId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: number) {
    return this.reviewsService.getByUser(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameId')
  create(@Req() req, @Param('gameId') gameId: number, @Body() body) {
    return this.reviewsService.create(
      req.user.userId,
      +gameId,
      body.text,
      body.name,            // ✅ Nombre del juego
      body.backgroundImage, // ✅ Imagen del juego
      body.rating,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':reviewId')
  update(@Req() req, @Param('reviewId') reviewId: number, @Body() body) {
    return this.reviewsService.update(
      req.user.userId,
      +reviewId,
      body.text,
      body.rating,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':reviewId')
  remove(@Req() req, @Param('reviewId') reviewId: number) {
    return this.reviewsService.remove(req.user.userId, +reviewId);
  }
}
