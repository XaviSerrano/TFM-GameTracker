import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RawgService } from './rawg.service';
import { RawgController } from './rawg.controller';
import { RawgAdapter } from './adapters/rawg.adapter';

@Module({
  imports: [HttpModule],
  controllers: [RawgController],
  providers: [RawgService, RawgAdapter],
  exports: [RawgService]
})
export class RawgModule {}