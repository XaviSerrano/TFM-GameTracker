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

  // 📚 colección pública de un usuario
  @Get('user/:userId/status/:status')
  async getUserGamesByStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('status') status: GameStatus,
  ) {
    return this.userGameService.getUserGamesByStatus(userId, status);
  }

  // 🔐 STATUS de un juego del usuario logueado
  @UseGuards(AuthGuard('jwt'))
  @Get('status/:gameId')
  async getGameStatus(
    @Req() req: AuthRequest,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.userGameService.getGameStatus(req.user.userId, gameId);
  }

  // 🎮 SET STATUS
  @UseGuards(AuthGuard('jwt'))
  @Post('status')
  async setStatus(@Req() req: AuthRequest, @Body() body) {
    return this.userGameService.setStatus(
      req.user.userId,
      body.gameId,
      body.status,
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
}
