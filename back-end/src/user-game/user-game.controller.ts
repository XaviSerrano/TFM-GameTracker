import { Request } from 'express';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserGameService, GameStatus } from './user-game.service';

interface AuthRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('user-games')
export class UserGameController {
  constructor(private readonly userGameService: UserGameService) {}

  // 📚 Colección pública - SIN GUARD, va primero
  @Get('user/:userId/status/:status')
  async getUserGamesByStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('status') status: GameStatus,
  ) {
    return this.userGameService.getUserGamesByStatus(userId, status);
  }

  // 🎮 SET STATUS
  @UseGuards(AuthGuard('jwt'))
  @Post('status')
  async setStatus(@Req() req: AuthRequest, @Body() body) {
    return this.userGameService.setStatus(
      req.user.userId,
      body.gameId,
      body.status,
      {
        name: body.name,
        backgroundImage: body.backgroundImage,
        released: body.released,
        rating: body.rating, // 👈 rating IGDB
      }
    );
  }

  // ⭐ SET RATING
  @UseGuards(AuthGuard('jwt'))
  @Post('rating')
  async setRating(@Req() req: AuthRequest, @Body() body) {
    return this.userGameService.setRating(
      req.user.userId,
      body.gameId,
      body.rating,
    );
  }

  // ⏱️ SET PLAYTIME
  @UseGuards(AuthGuard('jwt'))
  @Post('playtime')
  async setPlaytime(@Req() req: AuthRequest, @Body() body) {
    return this.userGameService.setPlaytime(
      req.user.userId,
      body.gameId,
      body.playtime,
    );
  }

  // 📚 Colección privada del usuario logueado
  // ✅ RENOMBRADA: /my-collection/:status en vez de /:status
  @UseGuards(AuthGuard('jwt'))
  @Get('my-collection/:status')
  async getMyGamesByStatus(
    @Req() req: AuthRequest,
    @Param('status') status: GameStatus,
  ) {
    return this.userGameService.getUserGamesByStatus(req.user.userId, status);
  }

  // 🔐 STATUS de un juego concreto - va AL FINAL para evitar conflictos
  // ✅ RENOMBRADA: /game-status/:gameId en vez de /status/:gameId
  @UseGuards(AuthGuard('jwt'))
  @Get('game-status/:gameId')
  async getGameStatus(
    @Req() req: AuthRequest,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.userGameService.getGameStatus(req.user.userId, gameId);
  }
}
