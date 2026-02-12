import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IgdbController } from './rawg.controller';
import { GamesService } from './games.service';
import { IgdbAdapter } from './adapters/igdb.adapter';
import { IgdbApiService } from './services/igdb-api.service';

@Module({
  imports: [HttpModule],
  controllers: [IgdbController],
  providers: [
    GamesService,
    IgdbAdapter,
    IgdbApiService
  ],
  exports: [GamesService],
})
export class RawgModule {}