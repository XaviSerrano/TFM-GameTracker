import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './create-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post(':gameId')
  @UseGuards(AuthGuard('jwt'))
  async addToWishlist(
    @Param('gameId') gameId: string,
    @Body() body: CreateWishlistDto,
    @Req() req,
  ) {
    const userId = req.user.userId;

    return this.wishlistService.addToWishlist(userId, {
      id: Number(gameId),
      name: body.gameName,
      background_image: body.backgroundImage,
      rating: body.rating,
    });
  }

  @Delete(':gameId')
  @UseGuards(AuthGuard('jwt'))
  async removeFromWishlist(@Param('gameId') gameId: string, @Req() req) {
    const userId = req.user.userId;
    return this.wishlistService.removeFromWishlist(userId, Number(gameId));
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getWishlist(@Req() req) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @Get('check/:gameId')
  @UseGuards(AuthGuard('jwt'))
  async checkInWishlist(@Param('gameId') gameId: string, @Req() req) {
    return this.wishlistService.isInWishlist(
      req.user.userId,
      Number(gameId),
    );
  }

  @Get('user/:userId')
  async getWishlistByUser(@Param('userId') userId: string) {
    return this.wishlistService.getWishlistByUser(Number(userId));
  }
}
