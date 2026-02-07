// import { Controller, Get, Param, Query } from '@nestjs/common';
// import { RawgService } from './rawg.service';

// @Controller('rawg')
// export class RawgController {
//   constructor(private readonly rawgService: RawgService) {}

//   @Get('trending')
//     getTrending() {
//     return this.rawgService.getTrendingGames();
//   }

//   @Get('top')
//     getTop250(@Query('minRatings') minRatings?: string) {
//     return this.rawgService.getTop250Games(Number(minRatings) || 50);
//   }


//   @Get('indie')
//     getTopIndie(@Query('minRatings') minRatings?: string) {
//     return this.rawgService.getTopIndieGames(Number(minRatings) || 50);
//   }


//   @Get('search')
//     search(@Query('q') query: string) {
//     return this.rawgService.getGamesByName(query);
//   }


//   @Get(':id')
//     getById(@Param('id') id: string) {
//     return this.rawgService.getGameById(Number(id));
//   }
// }

import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';
@Controller('rawg')
export class RawgController {
  constructor(private readonly gamesService: GamesService) {} // ✅ Cambiado

  @Get('trending')
  getTrending() {
    return this.gamesService.getTrendingGames();
  }

  @Get('top')
  getTop250(@Query('minRatings') minRatings?: string) {
    return this.gamesService.getTop250Games();
  }

  @Get('top-indie')
  getTopIndie(@Query('minRatings') minRatings?: string) {
    return this.gamesService.getTopIndieGames();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.gamesService.getGamesByName(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.gamesService.getGameById(Number(id));
  }
}